import $ from 'jquery';
import 'popper.js';
import 'bootstrap'
import '../css/style.css';
import axios from 'axios'
import index from './index.js';


index.init()
.then( s => console.log("Index initialized: ", s) )
.then( _ => index.tests() )
