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
import { Injectable } from "@aczwink/acts-util-node";
import { AccountService, TransactionType } from "./AccountService";
import { CalendarDate } from "../model/CalendarDate";

@Injectable
export class CreditCardService
{
    constructor(private accountService: AccountService)
    {
    }

    public ComputeBill(accountName: string, year: number, month: number)
    {
        const sum = this.FetchTransactionsDuringBillingPeriod(accountName, year, month)
            .Map(x => x.amount)
            .Accumulate( (x, y) => x.add(y) );

        return sum;
    }

    public FetchTransactionsDuringBillingPeriod(accountName: string, year: number, month: number)
    {
        const account = this.accountService.QueryAccountData(accountName);
        if(account.type !== "credit-card")
            throw new Error(accountName + " is not a credit card.");

        const minDate = new CalendarDate((month === 1) ? (year - 1) : year,  (month === 1) ? 12 : month-1, account.compensation!.billingPeriodDay);
        const maxDate = new CalendarDate(year, month, account.compensation!.billingPeriodDay);

        return this.accountService.QueryTransactions()
            .Filter(x => x.accountName === accountName)
            .Filter(x => x.valueDate.IsAfter(minDate) && x.valueDate.IsBeforeOrEqual(maxDate))
            .Filter(x => x.type !== TransactionType.AccountTransfer);
    }

    public FindCreditCardCompensationTransactions(accountName: string, year: number)
    {
        return this.accountService.QueryTransactions()
            .Filter(x => x.accountName === accountName)
            .Filter(x => x.valueDate.year === year)
            .Filter(x => x.type === TransactionType.AccountTransfer);
    }
}