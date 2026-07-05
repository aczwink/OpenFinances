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
import { Routes } from "@aczwink/acfrontend";
import { BalanceComponent } from "./BalanceComponent";
import { ViewTransactionsComponent } from "./ViewTransactionsComponent";
import { YearlyInsightsComponent } from "./YearlyInsightsComponent";
import { ViewAccountComponent } from "./ViewAccountComponent";

export const routes : Routes = [
    { path: "accounts/{accountName}", component: ViewAccountComponent },
    { path: "balance", component: BalanceComponent },
    { path: "insights", component: YearlyInsightsComponent },
    { path: "transactions", component: ViewTransactionsComponent },
    { path: "", redirect: "balance" },
    //{ path: "*", component: } 404
];