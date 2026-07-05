/**
 * OpenFinances
 * Copyright (C) 2026 Amir Czwink (amir130@hotmail.de)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * */
import fs from "fs/promises";
import path from "path";
import env from "../env";
import { readSheet } from "read-excel-file/node";
import { Injectable } from "@aczwink/acts-util-node";
import YAML from "js-yaml";
import * as csv from "fast-csv";
import { Dictionary, ObjectExtensions, Of } from "@aczwink/acts-util-core";
import { Money } from "@dintero/money";
import { CalendarDate } from "../model/CalendarDate";

interface AccountData
{
    type: "credit-card" | "transaction-account";
    compensation?: {
        billingPeriodDay: number;
        field: "booking-reference";
        value: string;
    };
    iban: string;
    startAmount: Money;
    transactions: Transaction[];
}

interface FieldData
{
    format?: "dd.mm.yy" | "dd.mm.yyyy" | "euro" | "euro-de" | "euro-de-eursign" | "isodate";
    index: number;
}

interface MappingData
{
    delimiter: string;
    preRowFilter?: {
        index: number;
        value: string;
    }
    startRow: number;
    fields: Dictionary<FieldData>;
}

export enum TransactionType
{
    AccountTransfer,
    Payment,
}

interface Transaction
{
    amount: Money;
    bookingReference: string;
    partnerName: string;
    partnerIBAN: string;
    tags: string[];
    type: TransactionType;
    valueDate: CalendarDate;
}

export interface TransactionWithAccount extends Transaction
{
    accountName: string;
}

interface RawAccountData
{
    type: "credit-card" | "transaction-account";
    compensation?: {
        billingPeriodDay: number;
        field: "booking-reference";
        value: string;
    };
    iban: string;
    startAmount?: string;
}

interface RawTaggingData
{
    rules: {
        field: "booking-reference" | "partnerName";
        value: string;
        tag: string;
    }[];
}

@Injectable
export class AccountService
{
    constructor()
    {
        this.accounts = {};
    }

    //Public methods
    public async LoadAllData()
    {
        await this.LoadData(env.dataPath);
    }

    public QueryAccountBalances(date: CalendarDate)
    {
        const result = [];

        for (const accountName in this.accounts)
        {
            if (!Object.hasOwn(this.accounts, accountName))
                continue;
            
            const account = this.accounts[accountName]!;

            let sum = account.startAmount;
            for (const transaction of account.transactions)
            {
                if(transaction.valueDate.IsAfter(date))
                    continue;

                sum = sum.add(transaction.amount);
            }

            result.push({
                accountName,
                balance: sum
            });
        }

        return result;
    }

    public QueryAccountData(accountName: string)
    {
        return this.accounts[accountName]!;
    }

    public QueryAccountNames()
    {
        return ObjectExtensions.OwnKeys(this.accounts).Map(x => x.toString());
    }

    public QueryFirstTransactionDate()
    {
        return ObjectExtensions.Values(this.accounts).NotUndefined()
            .Map(x => x.transactions.Values()).Flatten()
            .Map(x => x.valueDate)
            .Accumulate( (x, y) => x.IsAfter(y) ? y : x);
    }

    public QueryTransactions()
    {
        return ObjectExtensions.Entries(this.accounts)
            .Map(kv => kv.value!.transactions.Values()
                .Map(x => Of<TransactionWithAccount>({
                    accountName: kv.key.toString(),
                    ...x,
                }))
            ).Flatten();
    }
    
    //Private methods
    private ApplyTags(transaction: Transaction, taggingData: RawTaggingData): string[]
    {
        const tags = [];

        for (const rule of taggingData.rules)
        {
            let variable;

            switch(rule.field)
            {
                case "booking-reference":
                    variable = transaction.bookingReference;
                    break;
                case "partnerName":
                    variable = transaction.partnerName;
                    break;
            }

            variable = variable.replace(/[ \t\r\n]+/g, " ");

            if(variable === rule.value)
                tags.push(rule.tag);
        }

        if(tags.length === 0)
            return ["unknown"];

        return tags;
    }

    private async LoadAccount(accountName: string)
    {
        const dataPath = path.join(env.dataPath, accountName, "data");
        const children = await fs.readdir(dataPath, "utf-8");

        const accountPath = path.join(env.dataPath, accountName, "account.yml");
        const accountData = YAML.load(await fs.readFile(accountPath, "utf-8")) as RawAccountData;

        const mappingPath = path.join(env.dataPath, accountName, "mapping.yml");
        const mappingData = YAML.load(await fs.readFile(mappingPath, "utf-8")) as MappingData;

        const transactions = [];
        for (const child of children)
        {
            const childPath = path.join(dataPath, child);
            const data = await fs.readFile(childPath);

            let tableData: any[][];
            switch(path.extname(child))
            {
                case ".csv":
                    tableData = await csv.parseString(data.toString("utf-8"), { delimiter: mappingData.delimiter }).toArray();
                    break;
                case ".xlsx":
                    tableData = await readSheet(data);
                    break;
                default:
                    throw new Error(child);
            }

            tableData = tableData.slice(mappingData.startRow);
            for (const row of tableData)
            {
                if(!this.PassesPreRowFilter(row, mappingData))
                    continue;

                const parsed = this.ParseRow(row, mappingData);

                transactions.push(parsed);
            }
        }

        this.accounts[accountName] = {
            type: accountData.type,
            iban: accountData.iban,
            transactions,
            startAmount: Money.of(accountData.startAmount ?? 0, "EUR")
        };

        if(accountData.compensation !== undefined)
            this.accounts[accountName].compensation = accountData.compensation;
    }

    private async LoadAccountFile<FileType>(accountName: string, fileTitle: string)
    {
        const accountPath = path.join(env.dataPath, accountName, fileTitle + ".yml");
        const rawData = await fs.readFile(accountPath, "utf-8");
        const data = YAML.load(rawData) as FileType;

        return data;
    }

    private async LoadData(dataDir: string)
    {
        const accountFolders = await fs.readdir(dataDir, "utf-8");
        for (const accFolder of accountFolders)
        {
            await this.LoadAccount(accFolder);
        }

        //analyze types
        const ownIBANs = ObjectExtensions.Values(this.accounts).NotUndefined()
            .Map(x => x.iban).ToSet();

        for (const accountName of accountFolders)
        {
            const account = this.accounts[accountName]!;

            const transactions = this.accounts[accountName]!.transactions;
            for (const t of transactions)
            {
                if(ownIBANs.has(t.partnerIBAN))
                    t.type = TransactionType.AccountTransfer;
                else if((account.compensation?.field === "booking-reference") && (t.bookingReference === account.compensation.value))
                    t.type = TransactionType.AccountTransfer; //the credit card adjustment
            }
        }

        //apply tags
        for (const accountName of accountFolders)
        {
            const taggingData = await this.LoadAccountFile<RawTaggingData>(accountName, "tagging");

            const transactions = this.accounts[accountName]!.transactions;
            for (const t of transactions)
            {
                if(t.type !== TransactionType.Payment)
                    continue;

                t.tags = this.ApplyTags(t, taggingData);
            }
        }
    }

    private ParseField(row: string[], mappingData: MappingData, fieldName: string): any
    {
        const field = mappingData.fields[fieldName];
        if(field === undefined)
            return "";

        const rawValue = row[field.index]!;

        switch(field.format)
        {
            case "dd.mm.yy":
            {
                const parts = rawValue.split(".").map(x => parseInt(x));
                return new CalendarDate(parts[2]! + 2000, parts[1]!, parts[0]!);
            }
            case "dd.mm.yyyy":
            {
                const parts = rawValue.split(".").map(x => parseInt(x));
                return new CalendarDate(parts[2]!, parts[1]!, parts[0]!);
            }
            case "euro":
                return Money.of(rawValue, "EUR");
            case "euro-de":
            {
                const text = rawValue.ReplaceAll(".", "").replace(",", ".");;
                return Money.of(text, "EUR");
            }
            case "euro-de-eursign":
            {
                const text = rawValue.substring(0, rawValue.length - 2).ReplaceAll(".", "").replace(",", ".").TrimLeft("+");
                return Money.of(text, "EUR");
            }
            case "isodate":
                return CalendarDate.ConstructFromISOString(rawValue);
        }

        return rawValue;
    }

    private ParseRow(row: any[], mappingData: MappingData): Transaction
    {
        return {
            amount: this.ParseField(row, mappingData, "amount"),
            bookingReference: this.ParseField(row, mappingData, "booking-reference"),
            partnerIBAN: this.ParseField(row, mappingData, "partner-IBAN"),
            partnerName: this.ParseField(row, mappingData, "partnerName"),
            tags: [],
            type: TransactionType.Payment,
            valueDate: this.ParseField(row, mappingData, "value-date")
        };
    }

    private PassesPreRowFilter(row: any[], mappingData: MappingData)
    {
        if(mappingData.preRowFilter === undefined)
            return true;

        const value = row[mappingData.preRowFilter.index];
        return value !== mappingData.preRowFilter.value;
    }

    //State
    private accounts: Dictionary<AccountData>;
}