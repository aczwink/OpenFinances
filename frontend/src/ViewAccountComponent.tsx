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
import { Injectable, Component, RouterState, ProgressSpinner, JSX_CreateElement, JSX_Fragment, FormField, Select } from "@aczwink/acfrontend";
import { APIService } from "./services/APIService";
import { RenderEuroAmount } from "./shared/money";
import { MonthToShortString } from "./shared/months";
import { TransactionDTO } from "../dist/api";
import { TransactionsTableComponent } from "./TransactionsTableComponent";

interface BillingData
{
    amount: number;
    month: number;
    year: number;
}

@Injectable
export class ViewAccountComponent extends Component
{
    constructor(private apiService: APIService, routerState: RouterState)
    {
        super();

        this.accountName = routerState.routeParams.accountName!;
        this.bills = null;
        this.compensationTransactions = null;
        this.billingPeriodTransactions = null;
    }

    protected Render(): RenderValue
    {
        if((this.bills === null) || (this.compensationTransactions === null))
            return <ProgressSpinner />;

        return <>
            <div className="row">
                <div className="col">
                    <h3>Monthly bills:</h3>
                    <table className="table table-striped table-hover table-sm">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.bills.map(x => <tr>
                                <td><a href="#" onclick={this.OnChangeBillingPeriod.bind(this, x)}>{MonthToShortString(x.month)} {x.year}</a></td>
                                <td>{RenderEuroAmount(x.amount)}</td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
                <div className="col">
                    <h3>Compensation payments:</h3>
                    <TransactionsTableComponent transactions={this.compensationTransactions} />
                </div>
            </div>
            <hr />
            <h3>Transactions in billing period:</h3>
            {this.RenderBillingPeriodTransactions()}
        </>;
    }

    //Private methods
    private async LoadBillingPeriod(billingData: BillingData)
    {
        const response = await this.apiService.accounts._any_.billingPeriod._any_._any_.get(this.accountName, billingData.year, billingData.month);
        this.billingPeriodTransactions = response.data;
    }

    private RenderBillingPeriodTransactions()
    {
        if(this.billingPeriodTransactions === null)
            return <ProgressSpinner />;

        return <TransactionsTableComponent transactions={this.billingPeriodTransactions} />;
    }

    //Event handlers
    private OnChangeBillingPeriod(billingData: BillingData, event: Event)
    {
        event.preventDefault();
        
        this.LoadBillingPeriod(billingData);
    }

    override async OnInitiated(): Promise<void>
    {
        const d = new Date();
        let m = d.getMonth();
        const year = d.getFullYear();

        const bills = [];
        while(m >= 1)
        {
            const response = await this.apiService.accounts._any_.bills._any_._any_.get(this.accountName, year, m);
            bills.push({
                amount: response.data,
                month: m,
                year
            });
            
            m--;
        }

        this.bills = bills;

        const response = await this.apiService.accounts._any_.compensations._any_.get(this.accountName, year);
        this.compensationTransactions = response.data;

        this.LoadBillingPeriod(this.bills[0]!);
    }

    //State
    private accountName: string;
    private bills: BillingData[] | null;
    private compensationTransactions: TransactionDTO[] | null;
    private billingPeriodTransactions: TransactionDTO[] | null;
}