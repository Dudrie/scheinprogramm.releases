export type Points = {
    achieved: number;
    total: number;
};

export class Sheet {
    private _id: string;
    private _sheetNr: number;
    private _date: Date;
    private _hasPresented: boolean;
    private mapPoints: Map<string, Points>;

    public set id(id: string) {
        this._id = id;
    }

    public get id(): string {
        return this._id;
    }

    public get sheetNr(): number {
        return this._sheetNr;
    }

    public get date(): Date {
        return this._date;
    }

    public get hasPresented(): boolean {
        return this._hasPresented;
    }

    constructor(id: string, sheetNr: number, date: Date, hasPresented: boolean, points?: Map<string, Points>) {
        this._id = id;
        this._sheetNr = sheetNr;
        this._date = date;

        this._hasPresented = hasPresented;
        this.mapPoints = new Map();

        if (points) {
            points.forEach((val, key) => this.mapPoints.set(key, val));
        }
    }

    /**
     * Saves the points of the given system in the sheet. If there were already saved points for that ID these points will be __overriden__.
     *
     * @param systemId ID of the system the points belong to
     * @param points Points to save in the sheet
     */
    public setPoints(systemId: string, points: Points): void {
        this.mapPoints.set(systemId, points);
    }

    /**
     * Returns the points of the system with the given ID saved in this sheet. If there aren't any points saved for this ID, a Point object with both, achieved and total, set to -1.
     *
     * @param systemId ID of the system of the points
     * @returns Points saved in the sheet of the given system ID (or {-1, -1} if none exists)
     */
    public getPoints(systemId: string): Points {
        if (!this.mapPoints.has(systemId)) {
            return {
                achieved: -1,
                total: -1
            };
        }

        return this.mapPoints.get(systemId) as Points;
    }
}