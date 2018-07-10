import { Lecture } from '../data/Lecture';
import { LectureSystem, SystemType } from '../data/LectureSystem';
import * as uuidv1 from 'uuid/v1'; // v1: Timestamp-UUID
import { Sheet } from '../data/Sheet';

// TODO: JSDoc Kommentare
export abstract class DataService {
    private static readonly SYSTEM_PREFIX = 'SYSTEM_';
    private static readonly LECTURE_PREFIX = 'LEC_';

    // TODO: Durch persistente Struktur ersetzen
    private static lectureList: Lecture[] = [];
    private static activeLecture: Lecture | undefined = undefined;

    /**
     * Generates a LectureSystem with an unique ID from the given information. This method will NOT add the created LectureSystem to the lecture.
     */
    public static generateLectureSystem(name: string, short: string, systemType: SystemType, criteria: number, pointsPerSheet: number): LectureSystem {
        return new LectureSystem(
            this.SYSTEM_PREFIX + uuidv1(),
            name,
            short,
            systemType,
            criteria,
            pointsPerSheet
        );
    }

    public static addLecture(name: string, systems: LectureSystem[], sheetCount: number, hasPresentationPoints: boolean, criteriaPresentation: number) {
        let id: string = this.generateLectureId();

        // TODO: Duplikate (gleicher Name) vermeiden
        let lec: Lecture = new Lecture(
            id,
            name,
            systems,
            sheetCount,
            hasPresentationPoints,
            criteriaPresentation
        );
        this.lectureList.push(lec);

        // return id;
    }

    public static setActiveLecture(activeLecture: Lecture) {
        this.activeLecture = activeLecture;
    }

    public static addSheetToActiveLecture(sheet: Sheet) {
        if (!this.activeLecture) {
            return;
        }

        // TODO: Überprüfen, ob es bereits ein Blatt für den Tag gibt.
        this.activeLecture.sheets.push(sheet);
    }

    public static getActiveLecture(): Lecture | undefined {
        return this.activeLecture;
    }

    public static getActiveLectureSystems(): LectureSystem[] {
        if (!this.activeLecture) {
            return [];
        }

        return this.activeLecture.getSystems();
    }

    public static getActiveLectureSheets(): Sheet[] {
        if (!this.activeLecture) {
            return [];
        }

        return this.activeLecture.sheets;
    }

    public static getLectures(): Lecture[] {
        return this.lectureList;
    }

    private static generateLectureId(): string {
        return this.LECTURE_PREFIX + uuidv1();
    }

    private static isLectureWithSameName(lecture: Lecture): boolean {
        for (let i = 0; i < this.lectureList.length; i++) {
            if (this.lectureList[i].name === lecture.name) {
                return true;
            }
        }

        return false;
    }

    // ============  DEBUG  ===================
    //
    public static generateDebugData() {
        let systems: LectureSystem[] = [
            this.generateLectureSystem('Votieren', '', SystemType.ART_PROZENT, 50, 0),
            this.generateLectureSystem('Schritflich', '', SystemType.ART_PROZENT, 60, 30),
            // this.generateLectureSystem('Schritflich', '', SystemType.ART_PROZENT, 60, 30),
            // this.generateLectureSystem('Schritflich', '', SystemType.ART_PROZENT, 60, 30),
            // this.generateLectureSystem('Schritflich', '', SystemType.ART_PROZENT, 60, 30),
        ];
        this.addLecture(
            'TESTVORLESUNG',
            systems,
            11,
            true,
            2
        );

        let sheet1 = new Sheet(1, new Date(Date.now()));
        let sheet2 = new Sheet(2, new Date(Date.now()));
        sheet1.setPoints(
            systems[0].id,
            { achieved: 5, total: 10 }
        );
        sheet1.setPoints(
            systems[1].id,
            { achieved: 12, total: 42 }
        );
        sheet2.setPoints(
            systems[0].id,
            { achieved: 0, total: 0 }
        );
        sheet2.setPoints(
            systems[1].id,
            { achieved: 17, total: 17 }
        );

        this.getLectures()[0].sheets.push(sheet1, sheet2);
    }
    //
    // ========================================
}