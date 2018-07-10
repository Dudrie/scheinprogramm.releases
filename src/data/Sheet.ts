export type Points = {
    achieved: number;
    total: number;
};

export class Sheet {
    private _sheetNr: number;
    private _date: Date;
    private _isPresented: boolean;
    private mapPoints: Map<string, Points>;

    public get sheetNr(): number {
        return this._sheetNr;
    }

    public get date(): Date {
        return this._date;
    }

    constructor(sheetNr: number, date: Date) {
        this._sheetNr = sheetNr;
        this._date = date;

        this._isPresented = false;
        this.mapPoints = new Map();
    }

    public setPoints(systemId: string, points: Points): void {
        this.mapPoints.set(systemId, points);
    }
}