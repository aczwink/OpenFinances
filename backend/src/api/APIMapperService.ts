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
import { EnumeratorBuilder, Of } from "@aczwink/acts-util-core";
import { Injectable } from "@aczwink/acts-util-node";
import { TransactionType, TransactionWithAccount } from "../services/AccountService";

interface TransactionDTO
{
    accountName: string;
    amount: number;
    correspondencePartner: string;
    correspondencePartnerIBAN: string;
    bookingReference: string;
    date: string;
    type: TransactionType;
    tags: string[];
}

@Injectable
export class APIMapperService
{
    public FetchTransactionDTOs(input: EnumeratorBuilder<TransactionWithAccount>)
    {
        return input.Map(x => Of<TransactionDTO>({
            accountName: x.accountName,
            amount: x.amount.toNumber(),
            correspondencePartner: x.partnerName,
            correspondencePartnerIBAN: x.partnerIBAN,
            bookingReference: x.bookingReference,
            date: x.valueDate.ToISOString(),
            tags: x.tags,
            type: x.type,
        }))
        .ToArray();
    }
}