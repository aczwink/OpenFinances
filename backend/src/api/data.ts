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


@APIController("data")
class _api_
{
    constructor(private accountService: AccountService)
    {
    }

    @Get("years")
    public async RequestYearsWithAvailableData()
    {
        return this.accountService.QueryTransactions().Map(kv => kv.valueDate.year).Distinct(x => x).ToArray();
    }
}