export type ValidationState<T> = {
    [K in keyof T]: T[K];
};

type ValidationRule<T> = {
    field: keyof T,
    method: <K extends keyof T>(fieldValue: T[K]) => boolean,
    validWhen: boolean,
    errorMessage: string
};

export type ValidationResults<T> = {
    isValid: boolean,
    fields: {
        [K in keyof T]: {
            isInvalid: boolean,
            wasValidated: boolean,
            errorMessage: string
        }
    }
};

export class FormValidator<T> {
    private validations: ValidationRule<T>[];
    private validationResults: ValidationResults<T>;

    constructor(validations: ValidationRule<T>[]) {
        this.validations = validations;
        this.validationResults = this.generateAllValidResult();
    }

    public validateAll(state: ValidationState<T>): ValidationResults<T> {
        this.validationResults = this.generateAllValidResult();

        this.validations.forEach((rule) => {
            if (!this.validationResults.fields[rule.field].isInvalid) {
                this.validateField(rule.field, state);
            }
        });

        return this.validationResults;
    }

    public validateField(field: keyof T, state: ValidationState<T>): ValidationResults<T> {
        let rule: ValidationRule<T> | undefined = this.validations.find((rule) => rule.field === field);

        if (!rule) {
            throw new Error(`FormValidator::validateField -- There is no rule for the file '${field}'`);
        }

        let isInvalid: boolean = rule.method(state[rule.field]) != rule.validWhen;

        this.validationResults.fields[rule.field] = {
            isInvalid,
            errorMessage: isInvalid ? rule.errorMessage : '',
            wasValidated: true
        };

        let isValid: boolean = true;
        (Object.keys(this.validationResults.fields) as (keyof T)[]).forEach((field) => {
            if (this.validationResults.fields[field].isInvalid) {
                isValid = false;
                return;
            }
        });

        this.validationResults.isValid = isValid;

        return this.validationResults;
    }

    public getValidationResults(): ValidationResults<T> {
        return this.validationResults;
    }

    private generateAllValidResult(): ValidationResults<T> {
        let validation: any = { isValid: true, fields: {} };

        this.validations.forEach((rule) => {
            validation.fields[rule.field] = { isInvalid: false, wasValidated: false, errorMessage: '' };
        });

        return validation;
    }
}