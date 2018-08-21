import { LectureSystem } from './LectureSystem';
import { Sheet } from './Sheet';

export class Lecture {
    private _id: string;
    private _name: string;

    private systems: LectureSystem[];
    private _totalSheetCount: number;
    private _hasPresentationPoints: boolean;
    private _criteriaPresentation: number;
    private _sheets: Sheet[];

    // region Getter & Setter
    // ID
    public get id(): string {
        return this._id;
    }
    public set id(id: string) {
        this._id = id;
    }

    // Name
    public get name(): string {
        return this._name;
    }
    public set name(name: string) {
        this._name = name;
    }

    public get sheets(): Sheet[] {
        return this._sheets;
    }

    public set sheets(sheets: Sheet[]) {
        this._sheets = sheets;
    }

    public get totalSheetCount(): number {
        return this._totalSheetCount;
    }

    public get hasPresentationPoints(): boolean {
        return this._hasPresentationPoints;
    }

    public get criteriaPresentation(): number {
        return this._criteriaPresentation;
    }

    // Systems
    public getSystems(): LectureSystem[] {
        return this.systems;
    }
    // endregion

    constructor(name: string, systems: LectureSystem[], totalSheetCount: number, hasPresentationPoints: boolean, criteriaPresentation: number ) {
        this._name = name;
        this._totalSheetCount = totalSheetCount;
        this._hasPresentationPoints = hasPresentationPoints;
        this._criteriaPresentation = criteriaPresentation;
        this.systems = systems;
        
        this._id = '';
        this._sheets = [];
    }
}