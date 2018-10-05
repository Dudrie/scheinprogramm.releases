
/**
 * Type of the system to determine how the criteria is used.
 */
export enum SystemType {
    /**
     * The system is percentage based. Student needs a certain percentage of all points to pass.
     */
    ART_PROZENT_TOTAL,
    /**
     * The system is percentage based. Student needs a certain percentage of sheets "passed" (a sheet is passed if this sheet has enough percentage)
     */
    ART_PROZENT_SHEETS,
    /**
     * The system is based on points. Student needs a certain point threshhold to pass.
     */
    ART_PUNKTE
}

export class LectureSystem {
    private _id: string;
    private _name: string;
    private _systemType: SystemType;
    private _criteria: number;
    private _criteriaPerSheet: number;
    private _pointsPerSheet: number;

    public get id(): string {
        return this._id;
    }

    public set id(id: string) {
        this._id = id;
    }

    public get name(): string {
        return this._name;
    }

    public get systemType(): SystemType {
        return this._systemType;
    }

    /**
     * Criteria is either (depending on the SystemType):
     * - A decimal number between 0 and 1 to represent a percentage value.
     * - A number greater 1 to represent the amount of points needed.
     */
    public get criteria(): number {
        return this._criteria;
    }

    public get criteriaPerSheet(): number {
        return this._criteriaPerSheet;
    }

    public get pointsPerSheet(): number {
        return this._pointsPerSheet;
    }

    constructor(name: string, systemType: SystemType, criteria: number, criteriaPerSheet: number, pointsPerSheet: number) {
        this._name = name;
        this._systemType = systemType;
        this._criteria = criteria;
        this._criteriaPerSheet = criteriaPerSheet;
        this._pointsPerSheet = pointsPerSheet;
        
        this._id = '';
    }
}