/* Copyright (c) 2020, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import Recipe from "./recipe";
import {
    TypeInput,
    TypeNormalisedInput,
    User,
    TypeInputSignUp,
    TypeNormalisedInputSignUp,
    TypeNormalisedInputSignIn,
    TypeInputResetPasswordUsingTokenFeature,
    TypeNormalisedInputResetPasswordUsingTokenFeature,
    NormalisedFormField,
} from "./types";
import { NormalisedAppinfo } from "../../types";
import { FORM_FIELD_EMAIL_ID, FORM_FIELD_PASSWORD_ID } from "./constants";
import { TypeNormalisedInputSignOutFeature, TypeInputSignOutFeature } from "./types";
import {
    getResetPasswordURL as defaultGetResetPasswordURL,
    createAndSendCustomEmail as defaultCreateAndSendCustomEmail,
} from "./passwordResetFunctions";

export function validateAndNormaliseUserInput(
    recipeInstance: Recipe,
    appInfo: NormalisedAppinfo,
    config?: TypeInput
): TypeNormalisedInput {
    let signUpFeature = validateAndNormaliseSignupConfig(
        recipeInstance,
        appInfo,
        config === undefined ? undefined : config.signUpFeature
    );

    let signInFeature = validateAndNormaliseSignInConfig(
        recipeInstance,
        appInfo,
        signUpFeature,
        config === undefined ? undefined : config.signInFeature
    );

    let resetPasswordUsingTokenFeature = validateAndNormaliseResetPasswordUsingTokenConfig(
        recipeInstance,
        appInfo,
        signUpFeature,
        config === undefined ? undefined : config.resetPasswordUsingTokenFeature
    );

    let signOutFeature = validateAndNormaliseSignOutConfig(
        recipeInstance,
        appInfo,
        config === undefined ? undefined : config.signOutFeature
    );

    return {
        signUpFeature,
        signInFeature,
        resetPasswordUsingTokenFeature,
        signOutFeature,
    };
}

function validateAndNormaliseSignOutConfig(
    recipeInstance: Recipe,
    appInfo: NormalisedAppinfo,
    config?: TypeInputSignOutFeature
): TypeNormalisedInputSignOutFeature {
    let disableDefaultImplementation =
        config === undefined || config.disableDefaultImplementation === undefined
            ? false
            : config.disableDefaultImplementation;

    return {
        disableDefaultImplementation,
    };
}

function validateAndNormaliseResetPasswordUsingTokenConfig(
    recipeInstance: Recipe,
    appInfo: NormalisedAppinfo,
    signUpConfig: TypeNormalisedInputSignUp,
    config?: TypeInputResetPasswordUsingTokenFeature
): TypeNormalisedInputResetPasswordUsingTokenFeature {
    let disableDefaultImplementation =
        config === undefined || config.disableDefaultImplementation === undefined
            ? false
            : config.disableDefaultImplementation;

    let formFieldsForPasswordResetForm: NormalisedFormField[] = signUpConfig.formFields
        .filter((filter) => filter.id === FORM_FIELD_PASSWORD_ID)
        .map((field) => {
            return {
                id: field.id,
                validate: field.validate,
                optional: false,
            };
        });

    let formFieldsForGenerateTokenForm: NormalisedFormField[] = signUpConfig.formFields
        .filter((filter) => filter.id === FORM_FIELD_EMAIL_ID)
        .map((field) => {
            return {
                id: field.id,
                validate: field.validate,
                optional: false,
            };
        });

    let getResetPasswordURL =
        config === undefined || config.getResetPasswordURL === undefined
            ? defaultGetResetPasswordURL(appInfo)
            : config.getResetPasswordURL;

    let createAndSendCustomEmail =
        config === undefined || config.createAndSendCustomEmail === undefined
            ? defaultCreateAndSendCustomEmail(appInfo)
            : config.createAndSendCustomEmail;

    return {
        disableDefaultImplementation,
        formFieldsForPasswordResetForm,
        formFieldsForGenerateTokenForm,
        getResetPasswordURL,
        createAndSendCustomEmail,
    };
}

function validateAndNormaliseSignInConfig(
    recipeInstance: Recipe,
    appInfo: NormalisedAppinfo,
    signUpConfig: TypeNormalisedInputSignUp,
    config?: TypeInputSignUp
): TypeNormalisedInputSignIn {
    let disableDefaultImplementation =
        config === undefined || config.disableDefaultImplementation === undefined
            ? false
            : config.disableDefaultImplementation;

    let formFields: NormalisedFormField[] = signUpConfig.formFields
        .filter((filter) => filter.id === FORM_FIELD_EMAIL_ID || filter.id === FORM_FIELD_PASSWORD_ID)
        .map((field) => {
            return {
                id: field.id,
                // see issue: https://github.com/supertokens/supertokens-node/issues/36
                validate: field.id === FORM_FIELD_EMAIL_ID ? field.validate : defaultValidator,
                optional: false,
            };
        });
    return {
        disableDefaultImplementation,
        formFields,
    };
}

function validateAndNormaliseSignupConfig(
    recipeInstance: Recipe,
    appInfo: NormalisedAppinfo,
    config?: TypeInputSignUp
): TypeNormalisedInputSignUp {
    let disableDefaultImplementation =
        config === undefined || config.disableDefaultImplementation === undefined
            ? false
            : config.disableDefaultImplementation;

    let formFields: NormalisedFormField[] = [];
    if (config !== undefined && config.formFields !== undefined) {
        config.formFields.forEach((field) => {
            if (field.id === FORM_FIELD_PASSWORD_ID) {
                formFields.push({
                    id: field.id,
                    validate: field.validate === undefined ? defaultPasswordValidator : field.validate,
                    optional: false,
                });
            } else if (field.id === FORM_FIELD_EMAIL_ID) {
                formFields.push({
                    id: field.id,
                    validate: field.validate === undefined ? defaultEmailValidator : field.validate,
                    optional: false,
                });
            } else {
                formFields.push({
                    id: field.id,
                    validate: field.validate === undefined ? defaultValidator : field.validate,
                    optional: field.optional === undefined ? false : field.optional,
                });
            }
        });
    }
    if (formFields.filter((field) => field.id === FORM_FIELD_PASSWORD_ID).length === 0) {
        // no password field give by user
        formFields.push({
            id: FORM_FIELD_PASSWORD_ID,
            validate: defaultPasswordValidator,
            optional: false,
        });
    }
    if (formFields.filter((field) => field.id === FORM_FIELD_EMAIL_ID).length === 0) {
        // no email field give by user
        formFields.push({
            id: FORM_FIELD_EMAIL_ID,
            validate: defaultEmailValidator,
            optional: false,
        });
    }

    let handleCustomFormFieldsPostSignUp: (user: User, formFields: { id: string; value: string }[]) => Promise<void> =
        config === undefined || config.handleCustomFormFieldsPostSignUp === undefined
            ? defaultHandleCustomFormFieldsPostSignUp
            : config.handleCustomFormFieldsPostSignUp;

    return {
        disableDefaultImplementation,
        formFields,
        handleCustomFormFieldsPostSignUp,
    };
}

async function defaultValidator(value: any): Promise<string | undefined> {
    return undefined;
}

async function defaultHandleCustomFormFieldsPostSignUp(user: User, formFields: { id: string; value: any }[]) {}

export async function defaultPasswordValidator(value: any) {
    // length >= 8 && < 100
    // must have a number and a character
    // as per https://github.com/supertokens/supertokens-auth-react/issues/5#issuecomment-709512438

    if (typeof value !== "string") {
        return "Development bug: Please make sure the password field yields a string";
    }

    if (value.length < 8) {
        return "Password must contain at least 8 characters, including a number";
    }

    if (value.length >= 100) {
        return "Password's length must be lesser than 100 characters";
    }

    if (value.match(/^.*[A-Za-z]+.*$/) === null) {
        return "Password must contain at least one alphabet";
    }

    if (value.match(/^.*[0-9]+.*$/) === null) {
        return "Password must contain at least one number";
    }

    return undefined;
}

export async function defaultEmailValidator(value: any) {
    // We check if the email syntax is correct
    // As per https://github.com/supertokens/supertokens-auth-react/issues/5#issuecomment-709512438
    // Regex from https://stackoverflow.com/a/46181/3867175

    if (typeof value !== "string") {
        return "Development bug: Please make sure the email field yields a string";
    }

    if (
        value.match(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ) === null
    ) {
        return "Email is invalid";
    }

    return undefined;
}
