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

import { Injectable, Component, RouterComponent, JSX_CreateElement, JSX_Fragment, NavItem, BootstrapIcon, Navigation } from "@aczwink/acfrontend";

@Injectable
export class RootComponent extends Component
{
    protected Render()
    {
        return <>
            <Navigation>
                <div className="row m-auto">
                    <div className="col-auto p-1" style="display: inline">
                        <div className="row align-items-start">
                            <div className="col-auto ps-0">
                                <h4>OpenFinances</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <ul className="nav nav-pills">
                            <NavItem route="/balance"><BootstrapIcon>bank</BootstrapIcon> Balance</NavItem>
                            <NavItem route="/insights"><BootstrapIcon>graph-up</BootstrapIcon> Insights</NavItem>
                            <NavItem route="/transactions"><BootstrapIcon>journal-text</BootstrapIcon> Transactions</NavItem>
                        </ul>
                    </div>
                </div>
            </Navigation>
            <div className="container-fluid">
                <RouterComponent />
            </div>
        </>;
    }
}