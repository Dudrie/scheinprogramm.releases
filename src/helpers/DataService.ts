import { Lecture } from '../data/Lecture';
import { LectureSystem, SystemType } from '../data/LectureSystem';

export abstract class DataService {
    private static readonly SYSTEM_PREFIX = 'SYSTEM_';

    // TODO: Durch persistente Struktur ersetzen
    private static lectureList: Lecture[] = [];
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

    private static isLectureWithSameName(lecture: Lecture): boolean {
        for (let i = 0; i < this.lectureList.length; i++) {
            if (this.lectureList[i].name === lecture.name) {
                return true;
            }
        }

        return false;
    }
}