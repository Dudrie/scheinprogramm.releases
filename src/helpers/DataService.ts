import { Lecture } from '../data/Lecture';
import { LectureSystem, SystemType } from '../data/LectureSystem';
import * as uuidv1 from 'uuid/v1'; // v1: Timestamp-UUID
import { Sheet, Points } from '../data/Sheet';
import * as fs from 'fs';

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

    public static DEV_saveFile() {
        // TODO: Speichern richtig machen, ggf. mit einem extra Save-Object (s. dsa-electron).
        let json: string = JSON.stringify(
            this.lectureList,
            (key, val) => {
                if (key === 'mapPoints') {
                    if (!(val instanceof Map)) {
                        return val;
                    }

                    // let mapObj = {};
                    // val.forEach((v, k) => mapObj[k.toString()] = v);

                    return [...val];
                }

                return val;
            },
            2
        );

        fs.writeFileSync(
            'testfile.json',
            json,
            {
                encoding: 'utf8'
            }
        );
    }

    /**
     * Adds a lecture to the data and sets it's (unique) ID.
     *
     * @param lecture Lecture to add
     */
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

    /**
     * Deletes the lecture with the given ID from the data, if one exists.
     *
     * @param lecture Lecture to delete
     */
    public static deleteLecture(lectureId: string) {
        let idx = this.lectureList.findIndex((l) => l.id === lectureId);

        if (idx === -1) {
            return;
        }

        if (this.activeLecture && this.activeLecture.id === lectureId) {
            this.activeLecture = undefined;
        }

        this.lectureList.splice(idx, 1);
    }

    /**
     * Sets the given lecture as the _active lecture_ of the DataService.
     *
     * @param activeLecture Lecture to be the new active lecture
     */
    public static setActiveLecture(activeLecture: Lecture) {
        this.activeLecture = activeLecture;
    }

    /**
     * Adds the given sheet to the _active lecture_ if there is one. If there is none, nothing will happen.
     *
     * @param sheet Sheet to add to the _active lecture_
     */
    public static addSheetToActiveLecture(sheet: Sheet) {
        if (!this.activeLecture) {
            return;
        }

        sheet.id = this.generateSheetId();

        // TODO: Überprüfen, ob es bereits ein Blatt für den Tag gibt.
        this.activeLecture.sheets.push(sheet);
    }

    /**
     * Replaces the internal sheet with the same ID as the given sheet in the _active lecture_ with the given sheet. If there's no _active lecture_ on calling this function nothing will happen.
     *
     * @param sheet Sheet with the __same ID__ as the sheet which got edited. Contains all information needed for the edit.
     */
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

    /**
     * Removes the sheet with the given ID from the _active lecture_. If there's no _active lecture_ or if there's no sheet with such ID nothing will happen.
     *
     * @param sheetId ID of the sheet to delete
     */
    public static removeSheetFromActiveLecture(sheetId: string) {
        if (!this.activeLecture) {
            return;
        }

        let idx = this.activeLecture.sheets.findIndex((s) => s.id === sheetId);

        if (idx === -1) {
            return;
        }

        this.activeLecture.sheets.splice(idx, 1);
    }

    /**
     * Returns the _active lecture_ of the DataService, if there's one. If there's no _active lecture_ than _undefined_ will be return.
     *
     * @returns The _active lecture_ if there's one, _undefined_ else
     */
    public static getActiveLecture(): Lecture | undefined {
        return this.activeLecture;
    }

    /**
     * Checks if the _active lecture_ has presentation points. If there's no _active lecture_ this method will return _false_.
     *
     * @returns _true_ if the _active lecture_ has presentation points, _false_ else
     */
    public static hasActiveLecturePresentation(): boolean {
        if (!this.activeLecture) {
            return false;
        }

        return this.activeLecture.hasPresentationPoints;
    }

    /**
     * Returns the achieved and totally needed presentation points of the _active lecture_. If there's no _active lecture_ or if it does not have presentation points the pair {-1, -1} will be returned.
     *
     * @returns Presentation points of the _active lecture_. If there are no points needed, {-1, -1}
     */
    public static getActiveLecturePresentationPoints(): Points {
        // if (!this.activeLecture || !this.activeLecture.hasPresentationPoints) {
        if (!this.activeLecture || !this.activeLecture.hasPresentationPoints) {
            return { achieved: -1, total: -1 };
        }

        let presentationCount: number = this.activeLecture.sheets.filter((s) => s.hasPresented).length;

        return {
            achieved: presentationCount,
            total: this.activeLecture.criteriaPresentation
        };
    }

    /**
     * Returns all lecture systems saved in the currently _active lecture_. If there's no _active lecture_ the list will be empty.
     *
     * @returns All LectureSystems of the _active lecture_. Will also be empty if there's no _active lecture_
     */
    public static getActiveLectureSystems(): LectureSystem[] {
        if (!this.activeLecture) {
            return [];
        }

        return this.activeLecture.getSystems();
    }

    /**
     * Returns all sheets of the currently _active lecture_. If there's no _active lecture_ the list will be empty.
     *
     * @returns List with all sheets of the _active lecture_. Will also be empty if there's no _active lecture_.
     */
    public static getActiveLectureSheets(): Sheet[] {
        if (!this.activeLecture) {
            return [];
        }

        return this.activeLecture.sheets;
    }

    /**
     * Returns the highest number currently assigned to a sheet in the _active lecture_. This __does not ensure__ that there aren't any 'holes' in the numbering of the sheets (ie through deletion). If there's no _active lecture_ or if there aren't any sheets saved yet, 0 will be returned - BUT if this function returns 0, this __does not mean__ that there is no _active lecture_ or that there aren't any sheets (this is intended, because there's the possibility that a sheet has the number 0)!
     *
     * @returns The highest number assigned to a sheet. If there's no _active lecture_ or if there aren't any sheets, 0 is returned.
     */
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

    /**
     * Returns the Points of the system with the given ID of the _active lecture_. All sheets, which are saved in the lecture, will be looked at and the points of each sheet will be added up. If there's no _active lecture_ or if there is no system with such ID, {0, 0} will be returned. However, {0, 0} does not necessarily mean that there is no _active lecture_ (this is intended, because you can save sheets with Points of {0, 0}).
     *
     * @param systemId ID of the system which Points should be returned.
     * @returns Sum of all points of the given system saved in the sheets. If there's no _active lecture_, {0, 0} is returned.
     */
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

    /**
     * Returns a list containing all lectures. These are _no copies_, so be careful if you change something directly without using DataService function - things can break!
     *
     * @returns List containing all saved lectures.
     */
    public static getLectures(): Lecture[] {
        return this.lectureList;
    }

    /**
     * Generates a unique ID for a Lecture. Consists of a UUID and a prefix.
     *
     * @returns Unique ID for a lecture.
     */
    private static generateLectureId(): string {
        return this.LECTURE_PREFIX + uuidv1();
    }

    /**
     * Generates a unique ID for a LectureSystem. Consists of a UUID and a prefix.
     *
     * @returns Unique ID for a LectureSystem.
     */
    public static generateLectureSystemId(): string {
        return this.SYSTEM_PREFIX + uuidv1();
    }

    /**
     * Generates a unique ID for a Sheet. Consists of a UUID and a prefix.
     *
     * @returns Unique ID for a Sheet.
     */
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