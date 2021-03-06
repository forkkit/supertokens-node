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
import SuperTokensError from "./error";

// For Express
export default class Wrapper {
    static init = Recipe.init;

    static Error = SuperTokensError;

    static signUp(email: string, password: string) {
        return Recipe.getInstanceOrThrowError().signUp(email, password);
    }

    static signIn(email: string, password: string) {
        return Recipe.getInstanceOrThrowError().signIn(email, password);
    }

    static getUserById(userId: string) {
        return Recipe.getInstanceOrThrowError().getUserById(userId);
    }

    static getUserByEmail(email: string) {
        return Recipe.getInstanceOrThrowError().getUserByEmail(email);
    }

    static createResetPasswordToken(userId: string) {
        return Recipe.getInstanceOrThrowError().createResetPasswordToken(userId);
    }

    static resetPasswordUsingToken(token: string, newPassword: string) {
        return Recipe.getInstanceOrThrowError().resetPasswordUsingToken(token, newPassword);
    }
}

export let init = Wrapper.init;

export let Error = Wrapper.Error;

export let signUp = Wrapper.signUp;

export let signIn = Wrapper.signIn;

export let getUserById = Wrapper.getUserById;

export let getUserByEmail = Wrapper.getUserByEmail;

export let createResetPasswordToken = Wrapper.createResetPasswordToken;

export let resetPasswordUsingToken = Wrapper.resetPasswordUsingToken;
