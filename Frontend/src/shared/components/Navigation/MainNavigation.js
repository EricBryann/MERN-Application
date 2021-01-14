import React, {useState} from "react";
import {Link} from "react-router-dom";

import "./MainNavigation.css"
import MainHeader from "./MainHeader";
import NavLinks from "./NavLinks"
import SideDrawer from "./SideDrawer";
import Backdrop from "../UIElements/Backdrop";

function MainNavigation(props) {
    //for smaller screen, side drawer which contains navigation buttons will appear
    const [drawerIsOpen, setDrawerIsOpen] = useState(false);

    function openDrawer() {
        setDrawerIsOpen(true);
    }

    function closeDrawer() {
        setDrawerIsOpen(false);
    }
    return (
        <React.Fragment>
            {drawerIsOpen && <Backdrop onClick={closeDrawer}/>}
            <SideDrawer show={drawerIsOpen} onClick={closeDrawer}>
                <nav className="main-navigation__drawer-nav">
                    <NavLinks />
                </nav>
            </SideDrawer>)
            <MainHeader>
                <button className="main-navigation__menu-btn" onClick={openDrawer}>
                    <span />
                    <span />
                    <span />
                </button>
                <h1 className="main-navigation__title">
                    <Link to="/">Your Places</Link>
                </h1>
                <nav className="main-navigation__header-nav">
                    <NavLinks/>
                </nav>
            </MainHeader>
        </React.Fragment>
    )
}

export default MainNavigation;