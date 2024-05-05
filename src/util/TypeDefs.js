import * as THREE from "three";

/**
 * @typedef Statement 
 * @property {number[]} x
 * @property {number[]} y
 * @property {number[]} z
 * @property {string} xq 
 * @property {string} zq
 */

/**
 * @typedef Scheme
 * @property {string} x 
 * @property {string} y
 * @property {string} z 
 * @property {Statement[] | Statement[][]} statements 
 * @property {number[]} bounds
 */

/**
 * @typedef Axis 
 * @property {THREE.Vector3} dir 
 * @property {string} name 
 * @property {number[]} bounds
 */

export {};