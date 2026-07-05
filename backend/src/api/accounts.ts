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
import { APIController, Get, Path } from "@aczwink/acts-util-apilib";
import { AccountService } from "../services/AccountService";
import { CreditCardService } from "../services/CreditCardService";
import { APIMapperService } from "./APIMapperService";

@APIController("accounts")
class _api_
{
    constructor(private accountService: AccountService, private creditCardService: CreditCardService, private apiMapperService: APIMapperService)
    {
    }

    @Get()
    public RequestAccounts()
    {
        return this.accountService.QueryAccountNames().ToArray();
    }

    @Get("{accountName}/bills/{year}/{month}")
    public RequestCreditCardBill(
        @Path accountName: string,
        @Path year: number,
        @Path month: number
    )
    {
        const sum = this.creditCardService.ComputeBill(accountName, year, month);
        return sum.toNumber();
    }

    @Get("{accountName}/billingPeriod/{year}/{month}")
    public RequestCreditCardBillingPeriodTransactions(
        @Path accountName: string,
        @Path year: number,
        @Path month: number
    )
    {
        const transactions = this.creditCardService.FetchTransactionsDuringBillingPeriod(accountName, year, month);
        return this.apiMapperService.FetchTransactionDTOs(transactions);
    }

    @Get("{accountName}/compensations/{year}")
    public RequestCreditCardCompensations(
        @Path accountName: string,
        @Path year: number,
    )
    {
        const transactions = this.creditCardService.FindCreditCardCompensationTransactions(accountName, year);
        return this.apiMapperService.FetchTransactionDTOs(transactions);
    }
}