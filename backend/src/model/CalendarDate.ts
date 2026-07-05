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

import { DateTime } from "@aczwink/acts-util-node";

//TODO: migrate to ACTS-UTIL
export class CalendarDate
{
    constructor(year: number, month: number, day: number)
    {
        this._year = year;
        this._month = month;
        this._day = day;
    }

    //Properties
    public get month()
    {
        return this._month;
    }
    
    public get year()
    {
        return this._year;
    }

    //Public methods
    public Equals(other: CalendarDate)
    {
        return (this._year === other._year) && (this._month === other._month) && (this._day === other._day);
    }

    public IsBefore(other: CalendarDate)
    {
        if(this._year < other._year)
            return true;
        if(this._year > other._year)
            return false;

        if(this._month < other._month)
            return true;
        if(this._month > other._month)
            return false;

        return this._day < other._day;
    }

    public IsBeforeOrEqual(other: CalendarDate)
    {
        return this.Equals(other) || this.IsBefore(other);
    }

    public IsAfter(other: CalendarDate)
    {
        return other.IsBefore(this);
    }

    public IsAfterOrEqual(other: CalendarDate)
    {
        return this.Equals(other) || other.IsBefore(this);
    }

    public ToISOString()
    {
        return this._year + "-" + this.PadZeros(this._month, 2) + "-" + this.PadZeros(this._day, 2);
    }

    //Private methods
    private PadZeros(n: number, count: number)
    {
        let result = n.toString();

        while(result.length < count)
            result = "0" + result;

        return result;
    }

    //Class functions
    static ConstructFromISOString(isoString: string): CalendarDate
    {
        const parts = isoString.split("-").map(x => parseInt(x)!);
        return new CalendarDate(parts[0]!, parts[1]!, parts[2]!);
    }

    static Today()
    {
        const d = DateTime.Now();

        return new CalendarDate(d.year, d.month, d.dayOfMonth);
    }

    //State
    private _year: number;
    private _month: number;
    private _day: number;
}