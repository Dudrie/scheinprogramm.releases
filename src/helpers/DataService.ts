import { Lecture } from '../data/Lecture';
import { LectureSystem, SystemType } from '../data/LectureSystem';
import * as uuidv1 from 'uuid/v1'; // v1: Timestamp-UUID
import { Sheet, Points } from '../data/Sheet';

// TODO: JSDoc Kommentare
export abstract class DataService {
    private static readonly SYSTEM_PREFIX = 'SYSTEM_';
    private static readonly LECTURE_PREFIX = 'LEC_';
    private static readonly SHEET_PREFIX = 'SHEET_';

    // TODO: Durch persistente Struktur ersetzen
    private static lectureList: Lecture[] = [];
    private static activeLecture: Lecture | undefined = undefined;

    public static init() {
        // Generate one ID so the ID-generation gets initialized. This prevents lagging on the first generation of an actually needed UUID at runtime.
        uuidv1();
    }

    public static addLecture(lecture: Lecture) {
        lecture.id = this.generateLectureId();

        // // TODO: Duplikate (gleicher Name) vermeiden
        this.lectureList.push(lecture);
    }

    /**
     * Replaces the saved lecture with the id of the given lecture with the given (edited) lecture. Also, this method adjusts all things on the data layer which need to be adjusted after editing a lecture (ie removing not used systems from the sheets).
     * Note: The original lecture gets deleted in the process and it will be __replaced by the edited one__.
     *
     * @param lecture Lecture with the __same ID__ as the lecture which got edited. Contains all information needed for the edit.
     */
    public static editLecture(lecture: Lecture) {
        let idx = this.lectureList.findIndex((l) => l.id === lecture.id);

        if (idx === -1) {
            return;
        }

        let sheets: Sheet[] = this.lectureList[idx].sheets;
        let systemsOfEditedLecture: LectureSystem[] = lecture.getSystems();

        // TODO: Testen, ob die Systeme wirklich entfernt werden.
        this.lectureList[idx].getSystems().forEach((sys) => {
            // Check, if the system is NOT present in the edited lecture
            if (systemsOfEditedLecture.findIndex((el) => el.id === sys.id) === -1) {
                sheets.forEach((sheet) => sheet.removePoints(sys.id));
            }
        });

        lecture.sheets = sheets;
        this.lectureList[idx] = lecture;

        // If the edited lecture is the active lecture make sure that the active lecture has the updated object.
        if (this.activeLecture && this.activeLecture.id === lecture.id) {
            this.activeLecture = lecture;
        }
    }

    public static deleteLecture(lecture: Lecture) {
        let idx = this.lectureList.findIndex((l) => l.id === lecture.id);

        if (idx === -1) {
            return;
        }

        if (this.activeLecture && this.activeLecture.id === lecture.id) {
            this.activeLecture = undefined;
        }

        this.lectureList.splice(idx, 1);
    }

    public static setActiveLecture(activeLecture: Lecture) {
        this.activeLecture = activeLecture;
    }

    public static addSheetToActiveLecture(sheet: Sheet) {
        if (!this.activeLecture) {
            return;
        }

        sheet.id = this.generateSheetId();

        // TODO: Überprüfen, ob es bereits ein Blatt für den Tag gibt.
        this.activeLecture.sheets.push(sheet);
    }

    public static editSheetOfActiveLecture(sheet: Sheet) {
        if (!this.activeLecture) {
            return;
        }

        let idx: number = this.activeLecture.sheets.findIndex((val) => val.id === sheet.id);
        if (idx === -1) {
            return;
        }

        this.activeLecture.sheets[idx] = sheet;
    }

    public static removeSheetFromActiveLecture(sheet: Sheet) {
        if (!this.activeLecture) {
            return;
        }

        let idx = this.activeLecture.sheets.indexOf(sheet);

        if (idx === -1) {
            return;
        }

        this.activeLecture.sheets.splice(idx, 1);
    }

    public static getActiveLecture(): Lecture | undefined {
        return this.activeLecture;
    }

    public static hasActiveLecturePresentation(): boolean {
        if (!this.activeLecture) {
            return false;
        }

        return this.activeLecture.hasPresentationPoints;
    }

    public static getActiveLecturePresentationPoints(): Points {
        if (!this.activeLecture || !this.activeLecture.hasPresentationPoints) {
            return { achieved: -1, total: -1 };
        }

        let presentationCount: number = this.activeLecture.sheets.filter((s) => s.hasPresented).length;

        return {
            achieved: presentationCount,
            total: this.activeLecture.criteriaPresentation
        };
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

    public static getActiveLectureLastSheetNr(): number {
        if (!this.activeLecture || this.activeLecture.sheets.length === 0) {
            return 0;
        }

        let max = 0;

        for (let s of this.activeLecture.sheets) {
            if (s.sheetNr > max) {
                max = s.sheetNr;
            }
        }

        return max;
    }

    public static getActiveLecturePointsOfSystem(systemId: string): Points {
        if (!this.activeLecture) {
            return { achieved: 0, total: 0 };
        }

        let points: Points = {
            achieved: 0,
            total: 0
        };

        this.activeLecture.sheets.forEach((sheet) => {
            let sheetPoints = sheet.getPoints(systemId);
            if (sheetPoints.achieved === -1) {
                return;
            }

            points.achieved += sheetPoints.achieved;
            points.total += sheetPoints.total;
        });

        return points;
    }

    public static getLectures(): Lecture[] {
        return this.lectureList;
    }

    private static generateLectureId(): string {
        return this.LECTURE_PREFIX + uuidv1();
    }

    public static generateLectureSystemId(): string {
        return this.SYSTEM_PREFIX + uuidv1();
    }

    private static generateSheetId(): string {
        return this.SHEET_PREFIX + uuidv1();
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
            new LectureSystem('Votieren', SystemType.ART_PROZENT, 50, 0),
            new LectureSystem('Schriftlich', SystemType.ART_PROZENT, 60, 30),
        ];
        systems.forEach((sys) => sys.id = this.generateLectureSystemId());

        this.addLecture(new Lecture(
            'TESTVORLESUNG',
            systems,
            11,
            true,
            2
        ));

        let sheet1 = new Sheet(this.generateSheetId(), 1, new Date(Date.now()), true);
        let sheet2 = new Sheet(this.generateSheetId(), 2, new Date(Date.now()), false);
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