//Represent a user in the form of a card

import React from "react";

import Avatar from "../../shared/components/UIElements/Avatar"
import Card from "../../shared/components/UIElements/Card"
import "./UserItem.css"
import {Link} from "react-router-dom";

function UserItem(props) {
    console.log(props.image);
    return (
        <li className="user-item">
            <Card className="user-item__content">
                <Link to={`/${props.id}/places`}>
                    <div className="user-item__image">
                        <Avatar image={`${process.env.REACT_APP_ASSET_URL}/${props.image}`} alt={props.alt}/>
                    </div>
                    <div className="user-item__info">
                        <h2>{props.name}</h2>
                        <h3>
                            {props.placeCount} {props.placeCount === 1? "Place" : "Places"}
                        </h3>
                    </div>
                </Link>
            </Card>
        </li>
    )
}

export default UserItem;