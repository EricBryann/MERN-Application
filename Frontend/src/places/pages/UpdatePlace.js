import React , {useEffect, useState, useContext} from "react";
import {useParams, useHistory} from "react-router-dom";

import "./PlaceForm.css"
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import {VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH} from "../../shared/util/validators";
import {useForm} from "../../shared/hooks/form-hook";
import {useHttpClient} from "../../shared/hooks/http-hook";
import {AuthContext} from "../../shared/context/auth-context";
import Card from "../../shared/components/UIElements/Card"

//To update/change the details of a place
function UpdatePlace() {
    const auth = useContext(AuthContext);
    const {isLoading, error, sendRequest, clearError} = useHttpClient();
    const [loadedPlace, setLoadedPlace] = useState();
    const placeId = useParams().placeId;
    const history = useHistory();

    const [formState, inputHandler, setFormData] = useForm({
        title: {
            value: "",
            isValid: false
        },
        description: {
            value: "",
            isValid: false
        }
    }, true)

    //Retrieving stored title and description
    useEffect(() => {
        const fetchPlace = async() => {
            try{
                const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`)
                setLoadedPlace(responseData.place)
                setFormData({
                    title: {
                        value: responseData.place.title,
                        isValid: true
                    },
                    description: {
                        value: responseData.place.description,
                        isValid: true
                    }
                }, true);
            } catch (err) {

            }
            
        }
        fetchPlace();
    }, [sendRequest, placeId, setFormData]);

    
    async function placeUpdateSubmitHandler(event) {
        event.preventDefault();
        try {
            await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`,
                "PATCH",
                JSON.stringify({
                    title: formState.inputs.title.value,
                    description: formState.inputs.description.value
                }),
                {
                    "Content-type" : "application/json",
                    Authorization: "Bearer " + auth.token
                }
            )
            history.push(`/${auth.userId}/places`);
        } catch (err) {

        }
        
    }

    if (isLoading) {
        return (
            <div className="center">
                <LoadingSpinner/>
            </div>
        )
    }

    if(!loadedPlace && !error) {
        return(
            <div className="center">
                <Card>
                    <h2>Could not find place!</h2>
                </Card>
            </div>
        )
    }
    
    
    return (    
        <React.Fragment>
        <ErrorModal error={error} onClear={clearError}/>
            <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
                    <React.Fragment>
                        <Input 
                            id="title" 
                            element="input" 
                            type="text" 
                            label="Title" 
                            validators={[VALIDATOR_REQUIRE()]}
                            errorText="Please Enter a valid title"
                            onInput={inputHandler}
                            initialValue={loadedPlace.title}
                            initialValid={true}
                        />
                        <Input 
                            id="description" 
                            element="textarea" 
                            label="Description" 
                            validators={[VALIDATOR_MINLENGTH(5)]}
                            errorText="Please Enter a valid description (min 5 characters)"
                            onInput={inputHandler}
                            initialValue={loadedPlace.description}
                            initialValid={true}
                        />
                        <Button type="submit" disabled={!formState.isValid}>Update Place</Button>
                    </React.Fragment>
            </form>
        </React.Fragment>
    )
}

export default UpdatePlace;