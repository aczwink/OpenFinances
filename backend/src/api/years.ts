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
import { APIController, Get, Path, Query } from "@aczwink/acts-util-apilib";
import { AccountService, TransactionType, TransactionWithAccount } from "../services/AccountService";
import { Dictionary, EnumeratorBuilder, ObjectExtensions, Of } from "@aczwink/acts-util-core";
import { Money } from "@dintero/money";
import { APIMapperService } from "./APIMapperService";

interface TransactionStatistics
{
    income: number;
    outgoings: number;
    tagSpendings: {
        tag: string;
        amount: number;
        monthlyAverage: number;
    }[];
}

@APIController("years/{year}")
class _api_
{
    constructor(private accountService: AccountService, private apiMapperService: APIMapperService)
    {
    }

    @Get("month/{month}/transactions")
    public async RequestTransactionsInMonthWithinYear(
        @Path year: number,
        @Path month: number,
        @Query accountName?: string
    )
    {
        return this.apiMapperService.FetchTransactionDTOs(
            this.QueryMonthlyTransactions(year, month, accountName)
        );
    }

    @Get("month/{month}/stats")
    public async RequestMonthlyStatistics(
        @Path year: number,
        @Path month: number,
        @Query accountName?: string
    )
    {
        const monthlyTransactions = this.QueryMonthlyTransactions(year, month, accountName);

        return this.ComputeStats(monthlyTransactions);
    }

    @Get("months")
    public async RequestMonthsWithDataInYear(
        @Path year: number
    )
    {
        return this.accountService.QueryTransactions()
            .Filter(x => x.valueDate.year === year)
            .Map(x => x.valueDate.month)
            .Distinct(x => x)
            .ToArray();
    }

    @Get("stats")
    public async RequestYearlyStatistics(
        @Path year: number
    )
    {
        const yearlyTransactions = this.accountService.QueryTransactions()
            .Filter(x => x.valueDate.year === year);

        return this.ComputeStats(yearlyTransactions);
    }

    @Get("transactions")
    public async RequestTransactionsInYear(
        @Path year: number
    )
    {
        return this.apiMapperService.FetchTransactionDTOs(
            this.accountService.QueryTransactions()
                .Filter(x => x.valueDate.year === year)
        );
    }

    //Private methods
    private ComputeStats(transactions: EnumeratorBuilder<TransactionWithAccount>)
    {
        let income = Money.of(0, "EUR");
        let outgoings = Money.of(0, "EUR");

        for (const t of transactions)
        {
            if(t.type !== TransactionType.Payment)
                continue;

            if(t.amount.isNegative())
                outgoings = outgoings.add(t.amount);
            else
                income = income.add(t.amount);
        }

        const months = new Set();
        const tagSpendings: Dictionary<Money> = {};
        for (const t of transactions)
        {
            months.add(t.valueDate.month);
            if(t.amount.isNegative())
            {
                for (const tag of t.tags)
                {
                    const spendings = tagSpendings[tag];
                    if(spendings === undefined)
                        tagSpendings[tag] = t.amount;
                    else
                        tagSpendings[tag] = spendings.add(t.amount);
                }
            }
        }

        return Of<TransactionStatistics>({
            income: income.toNumber(),
            outgoings: outgoings.toNumber(),
            tagSpendings: ObjectExtensions.Entries(tagSpendings).Map(kv => ({
                tag: kv.key.toString(),
                amount: kv.value!.toNumber(),
                monthlyAverage: kv.value!.divide(months.size).toNumber(),
            })).ToArray()
        });
    }

    private QueryMonthlyTransactions(year: number, month: number, accountName?: string)
    {
        const filtered = this.accountService.QueryTransactions()
            .Filter(x => x.valueDate.year === year)
            .Filter(x => x.valueDate.month === month);

        if(accountName === undefined)
            return filtered;

        return filtered.Filter(x => x.accountName === accountName);
    }
}