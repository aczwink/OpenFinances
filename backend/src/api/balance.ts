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
import { APIController, Get, Query } from "@aczwink/acts-util-apilib";
import { AccountService } from "../services/AccountService";
import { CalendarDate } from "../model/CalendarDate";
import { Of } from "@aczwink/acts-util-core";

interface AccountBalance
{
    accountName: string;
    balance: number;
}

interface MonthlyBalance
{
    date: string;
    balance: number;
}

@APIController("balance")
class _api_
{
    constructor(private accountService: AccountService)
    {
    }

    @Get()
    public RequestMonthlyBalances()
    {
        const minDate = this.accountService.QueryFirstTransactionDate();
        const maxDate = CalendarDate.Today();

        let d = new CalendarDate(minDate.year, minDate.month, 15);
        const result: MonthlyBalance[] = [];
        while(d.IsBefore(maxDate))
        {
            const balance = this.accountService.QueryAccountBalances(d).Values()
                .Map(x => x.balance)
                .Accumulate( (a, b) => a.add(b));

            result.push({
                balance: balance.toNumber(),
                date: d.ToISOString()
            });

            if(d.month === 12)
                d = new CalendarDate(d.year + 1, 1, 15);
            else
                d = new CalendarDate(d.year, d.month + 1, 15);
        }

        return result;
    }

    @Get("date")
    public async RequestBalances(
        @Query date: string
    )
    {
        const typedDate = CalendarDate.ConstructFromISOString(date);
        return this.accountService.QueryAccountBalances(typedDate).map(x => Of<AccountBalance>({
            accountName: x.accountName,
            balance: x.balance.toNumber()
        }));
    }
}