export type Points = {
    achieved: number;
    total: number;
};

export class Sheet {
    private id: string;
    private sheetNr: number;
    private date: Date;
    private isPresented: boolean;
    private mapPoints: Map<number, Points>;

    constructor(id: string, sheetNr: number, date: Date) {
        this.id = id;
        this.sheetNr = sheetNr;
        this.date = date;

        this.isPresented = false;
        this.mapPoints = new Map();
    }
}