/* eslint-disable */

function a() {
  b();
}

function b() {
  c();
}

function c() {
  throw 'This is an expected runtime error.';
}

a();
