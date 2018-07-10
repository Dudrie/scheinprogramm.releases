import { Sheet } from './Sheet';

/**
 * Type of the system to determine how the criteria is used.
 */
export enum SystemType {
    /**
     * The system is percentage based, so the criteria has to be percentage value between 0 and 1. Student needs a certain percentage of all points to pass.
     */
    ART_PROZENT,
    /**
     * The system is based on points, so the criteria has to be a number greater 0. Student needs a certain point threshhold to pass.
     */
    ART_PUNKTE
}

export class LectureSystem {
    private _id: string;
    private _name: string;
    private short: string; // TODO: Werden die Shorts bei der neuen UI Aufteilung überhaupt gebraucht?
    private systemType: SystemType;
    /**
     * Criteria is either (depending on the SystemType):
     * - A decimal number between 0 and 1 to represent a percentage value.
     * - A number greater 1 to represent the amount of points needed.
     */
    private criteria: number;
    private pointsPerSheet: number;

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    constructor(id: string, name: string, short: string, systemType: SystemType, criteria: number, pointsPerSheet: number) {
        this._id = id;
        this._name = name;
        this.short = short;
        this.systemType = systemType;

        this.criteria = criteria;
        this.pointsPerSheet = pointsPerSheet;
    }
}