import { LectureSystem } from './LectureSystem';
import { Sheet } from './Sheet';

export class Lecture {
    private _id: string;
    private _name: string;

    private systems: LectureSystem[];
    private totalSheetCount: number;
    private hasPresentationPoints: boolean;
    private criteriaPresentation: number;
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

    public getTotalSheetCount(): number {
        return this.totalSheetCount;
    }

    public isHasPresentationPoints(): boolean {
        return this.hasPresentationPoints;
    }

    public getCriteriaPresentation(): number {
        return this.criteriaPresentation;
    }

    // Systems
    public getSystems(): LectureSystem[] {
        return this.systems;
    }
    // endregion

    constructor(name: string, systems: LectureSystem[], totalSheetCount: number, hasPresentationPoints: boolean, criteriaPresentation: number ) {
        this._name = name;
        this.systems = systems;
        this.totalSheetCount = totalSheetCount;
        this.hasPresentationPoints = hasPresentationPoints;
        this.criteriaPresentation = criteriaPresentation;
        
        this._id = '';
        this._sheets = [];
    }
}