import { Lecture } from '../data/Lecture';
import { LectureSystem, SystemType } from '../data/LectureSystem';
import * as uuidv1 from 'uuid/v1'; // v1: Timestamp-UUID

export abstract class DataService {
    private static readonly SYSTEM_PREFIX = 'SYSTEM_';
    private static readonly LECTURE_PREFIX = 'LEC_';

    // TODO: Durch persistente Struktur ersetzen
    private static lectureList: Lecture[] = [];
    private static activeLecture: Lecture | undefined = undefined;

    /**
     * Generates a LectureSystem with an unique ID from the given information. This method will NOT add the created LectureSystem to the lecture.
     */
    // public static generateLectureSystem(params: LectureSystemParams): LectureSystem {
    public static generateLectureSystem(name: string, short: string, systemType: SystemType, criteria: number, pointsPerSheet: number, hasAdditionalPoints: boolean): LectureSystem {
        return new LectureSystem(
            this.SYSTEM_PREFIX + uuidv1(),
            name,
            short,
            systemType,
            criteria,
            pointsPerSheet,
            hasAdditionalPoints
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

    public static getActiveLecture(): Lecture | undefined {
        return this.activeLecture;
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
}