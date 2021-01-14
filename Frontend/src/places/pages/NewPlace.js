import React , {useContext} from "react";
import {useHistory} from "react-router-dom";

import {VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH} from "../../shared/util/validators"
import Button from "../../shared/components/FormElements/Button"
import Input from "../../shared/components/FormElements/Input"
import ErrorModal from "../../shared/components/UIElements/ErrorModal"
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner"
import ImageUpload from "../../shared/components/FormElements/ImageUpload"
import "./PlaceForm.css"
import {useForm} from "../../shared/hooks/form-hook"
import {useHttpClient} from "../../shared/hooks/http-hook";
import {AuthContext} from "../../shared/context/auth-context";

//A new place that a user creates
function NewPlace() {
    const auth = useContext(AuthContext);
    const {isLoading, error, sendRequest, clearError} = useHttpClient();
    //Give the overall form a state. The component re-renders when the form changes
    const [formState, inputHandler] = useForm({
        title: {
            value: "",
            isValid: false
        },
        description: {
            value: "",
            isValid: false
        },
        address: {
            value: "",
            isValid: false
        },
        image: {
            value: null,
            isValid: false
        }
    }, false);

    const history = useHistory();
    
    async function placeSubmitHandler(event) {
        event.preventDefault();
        try {
            const formData = new FormData(); //FormData accepts not only text but also images
            formData.append("title", formState.inputs.title.value);
            formData.append("description", formState.inputs.description.value);
            formData.append("address", formState.inputs.address.value);
            formData.append("image", formState.inputs.image.value);
            await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places`, 
                "POST",
                formData,
                {Authorization: "Bearer " + auth.token}
            )
            history.push("/");
        } catch (err) {

        }  
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}/>
            <form className="place-form" onSubmit={placeSubmitHandler}>
                {isLoading && <LoadingSpinner asOverlay/>}
                <Input 
                    id="title"
                    element="input" 
                    type="text" 
                    label="Title" 
                    validators={[VALIDATOR_REQUIRE()]} 
                    onInput = {inputHandler}
                    errorText="Please enter a valid title"/>
                <Input 
                    id="description"
                    element="textarea"  
                    label="Description" 
                    validators={[VALIDATOR_MINLENGTH(5)]} 
                    onInput = {inputHandler}
                    errorText="Please enter a valid description (at least 5 characters)"/>
                <Input 
                    id="address"
                    element="input"  
                    label="Address" 
                    validators={[VALIDATOR_REQUIRE()]} 
                    onInput = {inputHandler}
                    errorText="Please enter a valid address"/>
                <ImageUpload id="image" onInput={inputHandler} errorText="Please provide an image"/>
                <Button type="submit" disabled={!formState.isValid}>
                    ADD PLACE
                </Button>
            </form>
        </React.Fragment>
    )
}

export default NewPlace;