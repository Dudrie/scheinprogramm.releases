import { LectureSystem } from './LectureSystem';
import { Sheet } from './Sheet';

export class Lecture {
    private _id: string;
    private _name: string;

    private systems: LectureSystem[];
    private totalSheetCount: number;
    private criteriaPresentation: number;
    private sheets: Sheet[];

    // region Getter & Setter
    // ID - readonly
    public get id(): string {
        return this._id;
    }

    // Name
    public get name(): string {
        return this._name;
    }
    public set name(name: string) {
        this._name = name;
    }

    // Systems
    public getSystems(): LectureSystem[] {
        return this.systems;
    }
    // endregion

    constructor(id: string, name: string, systems: LectureSystem[]) {
        this._id = id;
        this._name = name;

        this.systems = systems;
        this.totalSheetCount = 0;
        this.criteriaPresentation = 0;
        this.sheets = [];
    }

}