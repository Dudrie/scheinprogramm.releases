import * as uuidv1 from 'uuid/v1'; // v1: Timestamp-UUID
import { Lecture } from '../data/Lecture';
import { LectureSystem } from '../data/LectureSystem';
import { Points, Sheet } from '../data/Sheet';

/**
 * Service for handling all the data of the application. It also track which lecture of all present lectures is considered the _active lecture_ and it offers special methods for interacting with this lecture and for determine which lecture is considered _active_.
 */
export abstract class DataService {
    private static readonly SYSTEM_PREFIX = 'SYSTEM_';
    private static readonly LECTURE_PREFIX = 'LEC_';
    private static readonly SHEET_PREFIX = 'SHEET_';

    private static lectureList: Lecture[] = [];
    private static activeLecture: Lecture | undefined = undefined;

    public static init() {
        // Generate one ID so the ID-generation gets initialized. This prevents lagging on the first generation of an actually needed UUID at runtime.
        uuidv1();
    }

    /**
     * Adds a lecture to the data and sets it's (unique) ID.
     *
     * @param lecture Lecture to add
     */
    public static addLecture(lecture: Lecture) {
        lecture.id = this.generateLectureId();

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
     * Returns the count of the sheets in the _active lecture_. If there's no _active lecture_, 0 is returned. However, 0 is also returned if there are no sheets in the _active lecture_, so this __cannot__ be used as a test if there's an _active lecture_.
     *
     * @returns Sheet count of the _active lecture_. If there's no _active lecture_, 0 is returned.
     */
    public static getActiveLectureCurrentSheetCount(): number {
        if (!this.activeLecture) {
            return 0;
        }

        return this.activeLecture.sheets.length;
    }

    /**
     * Returns the total sheet count of the lecture. This is __not__ the number of sheets currently present but the number of sheets estimated over the whole semester. If there's no _active lecture_, 0 is returned. However, 0 is also returned if the estimated total sheet count in the _active lecture_ is actually 0, so this __cannot__ be used as a test if there's an _active lecture_.
     *
     * @returns Estimated sheet count of the current _active lecture_. If there's no active lecture, 0 is returned.
     */
    public static getActiveLectureTotalSheetCount(): number {
        if (!this.activeLecture) {
            return 0;
        }

        return this.activeLecture.totalSheetCount;
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
     * Returns all sheets of the currently _active lecture_. The sheets will be sorted by their dates (and by their number for tie breaks) by default. If neccessary, a specific sort function can be provieded.. If there's no _active lecture_ the list will be empty.
     *
     * @param sort (optional) Alternative sort function. If __not__ provided, sheets will be sorted by the number ascending.
     * @returns List with all sheets of the _active lecture_. Will also be empty if there's no _active lecture_.
     */
    public static getActiveLectureSheets(sort?: (a: Sheet, b: Sheet) => number): Sheet[] {
        if (!this.activeLecture) {
            return [];
        }

        // If there's no sort function provided, use the default sorting by the date (and if it's the same date by sheet number).
        if (!sort) {
            sort = ((a, b) => {
                let comp: number = a.date.valueOf() - b.date.valueOf();

                if (comp == 0) {
                    comp = a.sheetNr - b.sheetNr;
                }

                return comp;
            });
        }

        return this.activeLecture.sheets.sort(sort);
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
     * Checks if there's already a sheet with the given number in the _active lecture_. If there's no _active lecture_ _false_ is returned.
     *
     * @param sheetNr Number to check
     * @returns Is there already a sheet with this number in the _active lecture_?
     */
    public static hasActiveLectureSheetWithNr(sheetNr: number): boolean {
        if (!this.activeLecture) {
            return false;
        }

        for (let i = 0; i < this.activeLecture.sheets.length; i++) {
            if (this.activeLecture.sheets[i].sheetNr == sheetNr) {
                return true;
            }
        }

        return false;
    }

    public static hasActiveLectureSheetWithDate(date: Date): boolean {
        if (!this.activeLecture) {
            return false;
        }

        for (let i = 0; i < this.activeLecture.sheets.length; i++) {
            let shDate: Date = this.activeLecture.sheets[i].date;

            if (date.getFullYear() == shDate.getFullYear() && date.getMonth() == shDate.getMonth() && date.getDate() == shDate.getDate()) {
                return true;
            }
        }

        return false;
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

    /**
     * Converts the current lecture list into a JSON string.
     *
     * @returns Current lecture list as JSON string.
     */
    public static getDataAsJson(): string {
        return JSON.stringify(
            this.lectureList,
            (key, val) => {
                if (key === 'mapPoints' && val instanceof Map) {
                    return [...val];
                }

                return val;
            },
            2
        );
    }

    /**
     * Loads a lecture list from the given JSON. If the lectures were loaded successfully, they will be set as the available lectures. All lectures previously available/created will be overridden!
     *
     * @param json JSON to load
     */
    public static loadDataFromJson(json: string): boolean {
        let jsonObj: SaveType[];
        try {
            jsonObj = JSON.parse(
                json,
                (key, val) => {
                    if (key === 'mapPoints' && val instanceof Array) {
                        return new Map(val);
                    }

                    return val;
                }
            );
        } catch {
            // The JSON could not be parsed.
            console.error('[ERROR] Could not parse the given JSON.');
            return false;
        }

        // Check if the contents are a valid semester.
        if (!this.isValidLoadedSemester(jsonObj)) {
            return false;
        }

        // Transform every received lecture into an actual lecture object.
        let lectures: Lecture[] = [];

        for (let i = 0; i < jsonObj.length; i++) {
            let l = jsonObj[i];

            // Check, if the given object is a valid lecture.
            if (!this.isValidLoadedLecture(l)) {
                // If we found ONE non valid lecture, we abort.
                return false;
            }

            let systems: LectureSystem[] = [];
            let sheets: Sheet[] = [];

            let jsonSystems: LectureSystem[] = l['systems'];
            let jsonSheets: Sheet[] = l['_sheets'];

            for (let k = 0; k < jsonSystems.length; k++) {
                let sys = jsonSystems[k];

                // Check if the LectureSystem is valid. If not, abort.
                if (!this.isValidLoadedLectureSystem(sys)) {
                    return false;
                }

                let lecSys: LectureSystem = new LectureSystem(
                    sys['_name'],
                    sys['_systemType'],
                    sys['_criteria'],
                    sys['_pointsPerSheet']
                );

                lecSys.id = sys['_id'];
                systems.push(lecSys);
            }

            for (let k = 0; k < jsonSheets.length; k++) {
                let sh = jsonSheets[k];

                // Check if the Sheet is valid. If not, abort.
                if (!this.isValidLoadedSheet(sh)) {
                    return false;
                }

                sheets.push(new Sheet(
                    sh['_id'],
                    sh['_sheetNr'],
                    new Date(sh['_date']),
                    sh['_hasPresented'],
                    sh['mapPoints']
                ));
            }

            let lec = new Lecture(
                l['_name'],
                systems,
                l['_totalSheetCount'],
                l['_hasPresentationPoints'],
                l['_criteriaPresentation']
            );
            lec.id = l['_id'];
            lec.sheets = sheets;

            lectures.push(lec);
        }

        this.lectureList = lectures;
        this.activeLecture = undefined;

        return true;
    }

    /**
     * Clears the data saved in the DataService and unsets the _active lecture_.
     */
    public static clearData() {
        this.activeLecture = undefined;
        this.lectureList = [];
    }

    /**
     * Checks if the given Object is a valid semester.
     *
     * @param obj Object to check
     * @returns Is given Object a valid semester?
     */
    private static isValidLoadedSemester(obj: Object): boolean {
        if (!(obj instanceof Array)) {
            console.log('[ERROR] Loaded object is not an array');
            return false;
        }

        return true;
    }

    /**
     * Checks if the given Object is a valid Lecture.
     *
     * @param lecObj Lecutre to check
     * @returns Is the given Object a valid lecture?
     */
    private static isValidLoadedLecture(lecObj: Object): boolean {
        return this.hasObjectAllKeys(
            lecObj,
            ['_id', '_name', 'systems', '_totalSheetCount', '_hasPresentationPoints', '_criteriaPresentation', '_sheets']
        );
    }

    /**
     * Checks if the given Object is a valid LectureSystem.
     *
     * @param sysObj Object to check
     * @returns Is given Object a valid LectureSystem?
     */
    private static isValidLoadedLectureSystem(sysObj: Object): boolean {
        return this.hasObjectAllKeys(
            sysObj,
            ['_id', '_name', '_systemType', '_criteria', '_pointsPerSheet']
        );
    }

    /**
     * Checks if the given Object is a valid Sheet.
     *
     * @param shObj Object to check
     * @returns Is given Object a valid Sheet?
     */
    private static isValidLoadedSheet(shObj: Object): boolean {
        return this.hasObjectAllKeys(
            shObj,
            ['_id', '_sheetNr', '_date', '_hasPresented', 'mapPoints']
        );
    }

    /**
     * Checks if the given Object has all the given keys. The given Object __could've more__ keys than the given ones but the given ones are in it for sure if this method returns _true_.
     *
     * @param obj Object to checks
     * @param neededKeys Keys to look for
     * @returns Does the Object has (__at least__) all the given keys?
     */
    private static hasObjectAllKeys(obj: Object, neededKeys: string[]): boolean {
        for (let i = 0; i < neededKeys.length; i++) {
            if (!(neededKeys[i] in obj)) {
                console.log('[ERROR] Key \"' + neededKeys[i] + '\" is not in the given object.');
                return false;
            }
        }

        return true;
    }
}

type SaveType = Exclude<Lecture, Function>;