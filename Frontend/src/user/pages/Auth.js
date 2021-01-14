//Authentication and Authorization
//Interact with the backend to send and verify data
import React, {useState, useContext} from "react";

import "./Auth.css"
import Input from "../../shared/components/FormElements/Input"
import Button from "../../shared/components/FormElements/Button"
import Card from "../../shared/components/UIElements/Card"
import ErrorModal from "../../shared/components/UIElements/ErrorModal"
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner"
import {useHttpClient} from "../../shared/hooks/http-hook"
import {VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE} from "../../shared/util/validators"
import { useForm } from "../../shared/hooks/form-hook";
import {AuthContext} from "../../shared/context/auth-context";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";

function Auth() {
    const auth = useContext(AuthContext);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const {isLoading, error, sendRequest, clearError} = useHttpClient();
    const [formState, inputHandler, setFormData] = useForm({
        email: {
            value:"",
            isValid: false
        },
        password: {
            value:"",
            isValid: false
        }
    })
    async function authSubmitHandler(event) {
        event.preventDefault();

        if(isLoginMode) {
            try {
                const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/users/login`, 
                    "POST",
                    JSON.stringify ({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value
                    }), 
                    {
                        "Content-type" : "application/json" 
                    }
                );
                auth.login(responseData.userId, responseData.token); 
            } catch (err) {

            }
        } else {
            try{ 
                const formData = new FormData(); //Use FormData for images
                formData.append("email", formState.inputs.email.value);
                formData.append("name", formState.inputs.name.value);
                formData.append("password", formState.inputs.password.value);
                formData.append("image", formState.inputs.image.value);
                const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/users/signup`, 
                    "POST",
                    formData
                )              
                auth.login(responseData.userId, responseData.token);
            } catch (err) {
                
            } 
        }  
    }
    //switcing login mode to sign up mode or vice versa
    function switchModeHandler(event) {
        event.preventDefault();
        if (!isLoginMode) {
            setFormData({
                ...formState.inputs,
                name: undefined,
                image: undefined
            }, formState.inputs.email.isValid && formState.inputs.password.isValid)
        } else {
            setFormData({
                ...formState.inputs,
                name: {
                    value:"",
                    isValid: false
                },
                image: {
                    value: null,
                    isValid: false
                }
            }, false)
        }
        setIsLoginMode(prevMode => !prevMode);
    }
    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}/>
            <Card className="authentication">
                {isLoading && <LoadingSpinner asOverlay/>}
                <h2>Login Required</h2>
                <hr></hr>
                <form onSubmit={authSubmitHandler}>
                    {!isLoginMode && <Input 
                        element="input"
                        id="name"
                        label="Your Name"
                        type="text"
                        validators={[VALIDATOR_REQUIRE()]}
                        onInput={inputHandler}
                        errorText="Please Enter Your Name"
                        />}
                    {!isLoginMode && <ImageUpload center id="image" onInput={inputHandler} errorText="Please provide an image"/>}
                    <Input  element="input" 
                            id="email"
                            type="email"
                            label="E-mail"
                            validators={[VALIDATOR_EMAIL()]}
                            errorText="Please enter a valid email"
                            onInput={inputHandler}>
                    </Input>
                    <Input element="input" 
                            id="password"
                            type="password"
                            label="Password"
                            validators={[VALIDATOR_MINLENGTH(6)]}
                            errorText="Please enter a valid password at least 6 characters"
                            onInput={inputHandler}>
                    </Input>
                    <Button type="submit" disabled={!formState.isValid}>{isLoginMode ? "LOGIN" : "SIGNUP"}</Button>
                    <Button inverse onClick={switchModeHandler}>SWITCH TO {isLoginMode ? "SIGNUP" : "LOGIN"}</Button>
                </form>
            </Card>
        </React.Fragment>
    )
};

export default Auth;