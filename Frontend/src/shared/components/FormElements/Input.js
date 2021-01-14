import React, {useReducer, useEffect} from "react";

import "./Input.css"
import {validate} from "../../util/validators"

function inputReducer(state, action) {
    switch(action.type) {
        case "CHANGE":
            return {
                ...state,
                value: action.val,
                isValid: validate(action.val, action.validators)
            };
        case "TOUCH":
            return {
                ...state,
                isTouched: true
            }
        default:
            return state;
    }
}

function Input(props) {
    const [inputState, dispatch] = useReducer(inputReducer, {
        value: props.initialValue || "", 
        isValid: props.initialValid || false, 
        isTouched: false});

    const {id, onInput} = props;
    const {value, isValid} = inputState;

    useEffect(() => {
        onInput(id, value, isValid)
    }, [id, value, isValid, onInput]);

    function changeHandler(event) {
        dispatch({
            type: "CHANGE", 
            val: event.target.value,
            validators: props.validators});
    } 

    function touchHandler() {
        dispatch({type: "TOUCH"})
    }

    const element = props.element === "input" ? (
        <input id={props.id} type={props.type} placeholder={props.placeholder} onBlur={touchHandler} onChange={changeHandler} value={inputState.value}/>
    ) : (
        <textarea id={props.id} row={props.row || 3} onBlur={touchHandler} onChange={changeHandler} value={inputState.value}/>
    );
    return <div className={`form-control ${!inputState.isValid && inputState.isTouched && "form-control--invalid"}`}>
        <label htmlFor={props.id}>{props.label}</label>
        {element}
        {!inputState.isValid && inputState.isTouched && <p>{props.errorText}</p>}
    </div>
}

export default Input;