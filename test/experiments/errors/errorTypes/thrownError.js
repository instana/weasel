/* eslint-disable */

function a() {
  b();
}

function b() {
  c();
}

function c() {
  throw new Error('This is an expected runtime error.');
}

a();
