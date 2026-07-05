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

import { Injectable, Component, ProgressSpinner, JSX_CreateElement, JSX_Fragment, Anchor } from "@aczwink/acfrontend";
import { APIService } from "./services/APIService";
import { AccountBalance, MonthlyBalance } from "../dist/api";
import { LineChartComponent } from "./charts/LineChartComponent";
import { VerticalBarChartComponent } from "./charts/VerticalBarChartComponent";
import { RenderEuroAmount } from "./shared/money";

@Injectable
export class BalanceComponent extends Component
{
    constructor(private apiService: APIService)
    {
        super();

        this.data = null;
        this.monthlyBalances = [];
    }

    protected Render()
    {
        if(this.data === null)
            return <ProgressSpinner />;

        const labels = this.data.map(x => x.accountName);
        const balances = this.data.map(x => x.balance);

        const labels2 = this.monthlyBalances.map(x => x.date);
        const monthlyBalances = this.monthlyBalances.map(x => x.balance);

        return <>
        <div className="row">
            <div className="col">
                <table className="table table-striped table-hover table-sm">
                    <thead>
                        <tr>
                            <th>Account</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.data.map(x => <tr>
                            <td><Anchor route={"/accounts/" + x.accountName}>{x.accountName}</Anchor></td>
                            <td>{RenderEuroAmount(x.balance)}</td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
            <div className="col">
                <VerticalBarChartComponent labels={labels} dataSets={[{ label: "", values: balances }]} />
            </div>
        </div>
        <LineChartComponent labels={labels2} line={monthlyBalances} />
        </>;
    }

    //Event handlers
    override async OnInitiated(): Promise<void>
    {
        const response2 = await this.apiService.balance.get();
        this.monthlyBalances = response2.data;

        const now = new Date();
        const response = await this.apiService.balance.date.get({
            date: now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate(),
        });

        this.data = response.data;
    }

    //State
    private data: AccountBalance[] | null;
    private monthlyBalances: MonthlyBalance[];
}