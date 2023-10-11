document.addEventListener("DOMContentLoaded", function() {
    
  const col = document.createElement("div");
  col.classList.add("col");

  const img = document.createElement("img");
  img.src = `https://btk-maraton.obs.tr-west-1.myhuaweicloud.com:443/.png?AccessKeyId=MNMGXSIS80G65ST46FD4&Expires=1697026300&x-obs-security-token=gQ5hcC1zb3V0aGVhc3QtMYjAci8JsAtAQpQ7CdpPvkxSM8jhoZWoMLgHod6LsSAmZUxcLYoSa1yaFyt6VtES6Tmhqz0ER0DrLMOpCAMG-qf6ZiHw9OJ3GDkyiGCbMxAMfMYx68KcSPtYSACZMdSOckfXjChoI2uYN68Gq9B0nVibG4dW1dnBox7X3Rr2MlB6puSjwStQ2909b48soOQKldCMB9VA2_gqEcETieozK_pyN-5R9CXvsyrNF1oKPiY3_4VJSft3Jvi4EeU_yeYD8Tpz4vZcs0ef_wUj7xYjmYDgGHpEFd23_xYBnwTZnerh3KVrenZAI4Z9u_di2x2lgIeeYREj-Ko2BO6FXyNyN0RKYv8vxeZuIxMGS7dgeTeFQDjPvJa9CeEYk49t6007Y-Z7DaxZjRmKAw7QKPbBFlgX505WvLFIGZojvHc7iH-SIH3O6J2HVQiQ8sl-3qaf4CjkwoJ7UoD4Z2FVNGVrLds7syv2xJbwDZj14OFUAGZsrGlG1hLOthXASdWROfrbtuhOgnihf8uuiZBY8UhDQmbMVH5-NTevYhsWAxodrPWfAD4q_l0gnBh4f7q5qbHAbBuho4lbkU4zRxAbT4OrJ0_ssRz3xoBRESpN4SdZAIaXIF-0-Q901e2AH4ASIFxstSdWGx-mpgN-6QBbaSgMjxVD4kO_i5u-GSsknj2QpLcVh2fb96QpmK-UhS9M5qwYmC2xtCuS185c0r5Ddoujkwq7f2NAUhATpAXLawAdzI6HPsmGZj3x7B7yY5FdctBzsw5889CF5YdnWuzT1QvPzujpcaiTcPxkvEiND7L3BcOQMPB90a1mGn6CxNUfmfZOtgaP3KoKJoOLHw_-qyRM79hJisDoq_Kdk9f1Icud8GrvgJtzfR7E8ItjnmZ1Q537Zv-lS_CvTsXRhEHrm8koGREW&Signature=midlMkN56Rb/TOPPyPqDibqY1Es%3D`;
  img.alt = "Huawei Cloud Image";
  img.classList.add("img-fluid");

  col.appendChild(img);
  
  const container = document.querySelector(".container");
  container.appendChild(col);

});
