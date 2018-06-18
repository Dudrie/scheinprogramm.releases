import { Lecture } from '../data/Lecture';
import { LectureSystem, SystemType } from '../data/LectureSystem';

export abstract class DataService {
    private static readonly SYSTEM_PREFIX = 'SYSTEM_';
    private static readonly LECTURE_PREFIX = 'LEC_';

    // TODO: Durch persistente Struktur ersetzen
    private static lectureList: Lecture[] = [];
    private static highestIdSoFar: number = 0;
    // private static lastLectureId: number = -1;

    /**
     * Generates a LectureSystem with an unique ID from the given information. This method will NOT add the created LectureSystem to the lecture.
     */
    public static generateLectureSystem(name: string, short: string, systemType: SystemType, criteria: number, pointsPerSheet: number, hasAdditionalPoints: boolean): LectureSystem {
        // Find the next possible ID
        let id: number = 0;

        // TODO: Tatsächliche ID implementieren

        return new LectureSystem(
            this.SYSTEM_PREFIX + id,
            name,
            short,
            systemType,
            criteria,
            pointsPerSheet,
            hasAdditionalPoints
        );
    }

    public static addLecture(lecture: Lecture): string {
        let id: string = this.generateLectureId(lecture);

        // TODO: Duplikate (gleicher Name) vermeiden
        let lec: Lecture = new Lecture(
            id,
            lecture.name,
            lecture.getSystems()
        );
        this.lectureList.push(lec);
        
        return id;
    }

    public static getLectures(): Lecture[] {
        return this.lectureList;
    }
    
    private static generateLectureId(lecture: Lecture): string {
        // TODO: Schönere ID-Methode?
        return this.LECTURE_PREFIX + (++this.highestIdSoFar);
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