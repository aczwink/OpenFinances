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

import { BootstrapIcon, Component, JSX_CreateElement } from "@aczwink/acfrontend";
import { TransactionDTO, TransactionType } from "../dist/api";
import { RenderEuroAmount } from "./shared/money";

type OrderColumn = "amount" | "date";

export class TransactionsTableComponent extends Component<{ transactions: TransactionDTO[] }>
{
    constructor()
    {
        super();

        this.orderByAsc = true;
        this.orderByCol = null;
    }

    protected Render(): RenderValue
    {
        const transactions = this.GetOrderedTransactions();
        
        return <table className="table table-striped table-hover table-sm">
            <thead>
                <tr>
                    <td onclick={this.OnOrderByColumn.bind(this, "date")}>Date</td>
                    <td>Type</td>
                    <td>Account</td>
                    <td onclick={this.OnOrderByColumn.bind(this, "amount")}>Amount</td>
                    <td>Partner</td>
                    <td>Partner IBAN</td>
                    <td>Booking reference</td>
                    <td>Tags</td>
                </tr>
            </thead>
            <tbody>
                {transactions.map(x => <tr>
                    <td>{x.date}</td>
                    <td>{this.RenderTransactionType(x.type)}</td>
                    <td>{x.accountName}</td>
                    <td>{RenderEuroAmount(x.amount)}</td>
                    <td>{x.correspondencePartner}</td>
                    <td>{x.correspondencePartnerIBAN}</td>
                    <td>{x.bookingReference}</td>
                    <td>{x.tags.map(this.RenderTag.bind(this))}</td>
                </tr>)}
            </tbody>
        </table>;
    }

    //Private methods
    private GetOrderedTransactions()
    {
        switch(this.orderByCol)
        {
            case "amount":
                if(this.orderByAsc)
                    return this.input.transactions.Values().OrderBy(x => x.amount).ToArray();
                return this.input.transactions.Values().OrderByDescending(x => x.amount).ToArray();
            case "date":
                if(this.orderByAsc)
                    return this.input.transactions.Values().OrderBy(x => x.date).ToArray();
                return this.input.transactions.Values().OrderByDescending(x => x.date).ToArray();
        }

        return this.input.transactions;
    }

    private RenderTag(tag: string)
    {
        let color = "secondary";
        let icon = "question";

        switch(tag)
        {
            case "cash":
                color = "light";
                icon = "cash-coin";
                break;
            case "family-support":
                color = "primary";
                icon = "person-standing-dress";
                break;
            case "food-order":
                color = "danger";
                icon = "truck";
                break;
            case "groceries":
                color = "primary";
                icon = "egg-fried";
                break;
            case "health":
                color = "success";
                icon = "bandaid-fill";
                break;
            case "hobbies":
                color = "danger";
                icon = "balloon-fill";
                break;
            case "job":
                color = "success";
                icon = "wallet";
                break;
            case "lifestyle":
                color = "danger";
                icon = "brightness-alt-high-fill";
                break;
            case "living-costs":
                color = "primary";
                icon = "heart-fill";
                break;
            case "restaurants":
                color = "info";
                icon = "fork-knife";
                break;
            case "shopping":
                color = "danger";
                icon = "cart4";
                break;
            case "sports":
                color = "info";
                icon = "speedometer";
                break;
            case "vacation":
                color = "warning";
                icon = "airplane-fill";
                break;
        }

        return <span className={"badge rounded-pill text-bg-" + color}>
            <BootstrapIcon>{icon}</BootstrapIcon>
            {" " + tag}
        </span>;
    }
        
    private RenderTransactionType(type: TransactionType): string
    {
        switch(type)
        {
            case TransactionType.AccountTransfer:
                return "Account transfer";
            case TransactionType.Payment:
                return "Payment";
        }
    }

    //Event handlers
    private OnOrderByColumn(column: OrderColumn)
    {
        if(column === this.orderByCol)
            this.orderByAsc = !this.orderByAsc;
        else
        {
            this.orderByAsc = true;
            this.orderByCol = column;
        }
    }

    //State
    private orderByCol: OrderColumn | null;
    private orderByAsc: boolean;
}