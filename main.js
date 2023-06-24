"use strict";
const template = document.querySelector("#myTemp").content;
const link = "https://petlatkea.dk/2020/hogwarts/students.json";
const ministerylink = "https://petlatkea.dk/2020/hogwarts/families.json";



const parent = document.querySelector("ul.fulllist");
const modal = document.querySelector(".bg-modal");
const modalbg = document.querySelector(".modal-content");
const dropdown = document.querySelector("select");
let primaryData = [];
let usableData = [];
let expelledData = [];
let filteredData = [];

let prefectCounter = {
  Gryffindor: 0,
  Slytherin: 0,
  Hufflepuff: 0,
  Ravenclaw: 0
};

const protoStudent = {
  firstname: "",
  lastname: "",
  house: "",
  gender: "",
  nickname: "",
  middlename: "",
  expelled: "",
  prefect: "",
  bloodStatus: "",
  inquisitorial: ""
};

let magic = new Audio();
magic.src = "magic.flac";

let expelledgasp = new Audio();
expelledgasp.src = "expelledgasp.mp3";



window.addEventListener("DOMContentLoaded", init(link));
dropdown.addEventListener("change", filterOut);
document.querySelector("#fname").addEventListener("click", sortByFirst);
document.querySelector("#lname").addEventListener("click", sortByLast);
document.querySelector("#reverse").addEventListener("click", reverseArray);
document.querySelector("#expellButton").addEventListener("click", expell);
document.querySelector("#prefectButton").addEventListener("click", prefect);
document
  .querySelector("#prefectRevokeButton")
  .addEventListener("click", revokePrefect);
document
  .querySelector("#inquisitorialButton")
  .addEventListener("click", inquisitorialize);
document
  .querySelector("#inquisitorialRevokeButton")
  .addEventListener("click", deInquisitorialize);

document.addEventListener("click", function(e) {
  if (e.target.nodeName == "LI") {
    popModal(e.target.getAttribute("id"));
  }
});

document.querySelector("#close").addEventListener("click", function() {
  modal.classList.add("hide");
});

// on DOMcontentloaded

function init(link) {
  fetch(link)
    .then(e => e.json())
    .then(data => {
      primaryData = data;
      fixData(data);
      hackTheSystem();
      displayData(filteredData);
    });

  fetch(ministerylink)
    .then(e => e.json())
    .then(data => {
      defineBloodStatus(data);
    });
}

//fixData

function fixData(students) {
  students.forEach(studentJson => {
    const student = Object.create(protoStudent);

    let endOfFirstName = studentJson.fullname.trim().indexOf(" ");
    student.firstname = capitalize(studentJson.house.trim());
    if (endOfFirstName > 0) {
      student.firstname = capitalize(
        studentJson.fullname.trim().substring(0, endOfFirstName)
      );
      if ((studentJson.fullname.trim().match(/ /g) || []).length == 2) {
        if (studentJson.fullname.trim()[endOfFirstName + 1] == '"') {
          student.nickname = studentJson.fullname
            .trim()
            .substring(
              studentJson.fullname.trim().indexOf('"') + 1,
              studentJson.fullname.trim().lastIndexOf('"')
            );
          student.lastname = studentJson.fullname
            .trim()
            .substring(
              studentJson.fullname.trim().lastIndexOf(" ") + 1,
              studentJson.fullname.trim().length
            );
        } else {
          student.middlename = capitalize(
            studentJson.fullname
              .trim()
              .substring(
                studentJson.fullname.trim().indexOf(" ") + 1,
                studentJson.fullname.trim().lastIndexOf(" ")
              )
          );
          student.lastname = capitalize(
            studentJson.fullname
              .trim()
              .substring(
                studentJson.fullname.trim().lastIndexOf(" ") + 1,
                studentJson.fullname.trim().length
              )
          );
        }
      } else {
        student.middlename = false;
        student.nickname = false;
        student.lastname = capitalize(
          studentJson.fullname
            .trim()
            .substring(
              studentJson.fullname.trim().indexOf(" ") + 1,
              studentJson.fullname.trim().length
            )
        );
      }
    } else {
      student.firstname = capitalize(studentJson.fullname.trim());
      student.lastname = "~Unknown~";
      student.nickname = false;
      student.middlename = false;
    }
    student.house = capitalize(studentJson.house.trim());
    student.gender = studentJson.gender;
    usableData.push(student);
  });
  filteredData = usableData;
}

//capitalize first letter

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

//data display

function displayData(students) {
  parent.innerHTML = "";
  console.log(students);
  if (students.length == 1) {
    document.querySelector(".listnaming").textContent =
      "Showing " + students.length + " student";
  } else {
    document.querySelector(".listnaming").textContent =
      "Showing " + students.length + " students";
  }
  students.forEach(student => {
    let clone = template.cloneNode(true);

    clone.querySelector(".first-name").textContent = student.firstname;
    if (student.lastname) {
      clone.querySelector(".last-name").textContent = student.lastname;
    } else {
      clone.querySelector(".last-name").textContent = "~Unknown~";
    }
    clone.querySelector(".house").textContent = student.house;

    clone.querySelector("li").setAttribute("id", student.firstname);

    parent.appendChild(clone);
  });
}

//modal info

function popModal(studentName) {
  let filteredStudent = filteredData.filter(
    studentObject => studentObject.firstname === studentName
  )[0];

  document.querySelector("h5.expelled").classList.add("hide");
  document.querySelector("#prefectButton").disabled = false;
  document
    .querySelector("#expellButton")
    .setAttribute("value", filteredStudent.firstname);
  document
    .querySelector("#prefectButton")
    .setAttribute("value", filteredStudent.firstname);
  document
    .querySelector("#prefectRevokeButton")
    .setAttribute("value", filteredStudent.firstname);
  document
    .querySelector("#inquisitorialButton")
    .setAttribute("value", filteredStudent.firstname);

  document.querySelector("#inquisitorialButton").disabled = true;

  document
    .querySelector("#inquisitorialRevokeButton")
    .setAttribute("value", filteredStudent.firstname);

  modal.querySelector(".name").textContent =
    "First Name: " + filteredStudent.firstname;

  if (filteredStudent.middlename) {
    modal.querySelector(".middlename").textContent =
      "Middle Name: " + filteredStudent.middlename;
  } else {
    modal.querySelector(".middlename").textContent = "Middle Name: -";
  }

  if (filteredStudent.nickname) {
    modal.querySelector(".nickname").textContent =
      "Nickname: " + filteredStudent.nickname;
  } else {
    modal.querySelector(".nickname").textContent = "Nickname: -";
  }

  if (filteredStudent.lastname) {
    modal.querySelector(".lastname").textContent =
      "Last Name: " + filteredStudent.lastname;
  } else {
    modal.querySelector(".lastname").textContent = "Last Name: -";
  }

  modal.querySelector(".house").textContent = "House: " + filteredStudent.house;

  if (filteredStudent.house == "Slytherin") {
    document.querySelector(".wrap-crest > img").src = "images/Slytherin.png";
    modalbg.style.backgroundImage = "linear-gradient(#2a623d, #AAAAAA)";
    modalbg.style.color = "black";
  } else if (filteredStudent.house == "Gryffindor") {
    document.querySelector(".wrap-crest > img").src = "images/Gryffindor.png";
    modalbg.style.backgroundImage = "linear-gradient(#eeba30, #740001)";
    modalbg.style.color = "black";
  } else if (filteredStudent.house == "Hufflepuff") {
    document.querySelector(".wrap-crest > img").src = "images/Hufflepuff.png";
    modalbg.style.backgroundImage = "linear-gradient(#f0c75e, #726255)";
    modalbg.style.color = "white";
  } else if (filteredStudent.house == "Ravenclaw") {
    document.querySelector(".wrap-crest > img").src = "images/Ravenclaw.png";
    modalbg.style.backgroundImage = "linear-gradient(#4f5a90, #374798)";
    modalbg.style.color = "white";
  }

  if (filteredStudent.lastname.indexOf("-") > 0) {
    modal.querySelector(".wrap-profile > img").src =
      "images/" +
      filteredStudent.lastname.substring(
        filteredStudent.lastname.indexOf("-") + 1,
        filteredStudent.lastname.length
      ) +
      "_" +
      filteredStudent.firstname.charAt(0).toLowerCase() +
      ".png";
    modal.querySelector(".wrap-profile > img").classList.remove("hide");
  } else if (filteredStudent.lastname == "Patil") {
    //check for the same last name
    modal.querySelector(".wrap-profile > img").src =
      "images/" +
      filteredStudent.lastname.toLowerCase() +
      "_" +
      filteredStudent.firstname.toLowerCase() +
      ".png";
    modal.querySelector(".wrap-profile > img").classList.remove("hide");

  } else if (filteredStudent.lastname == "~Unknown~") {
    modal.querySelector(".wrap-profile > img").classList.add("hide");
  } else {
    modal.querySelector(".wrap-profile > img").src =
      "images/" +
      filteredStudent.lastname.toLowerCase() +
      "_" +
      filteredStudent.firstname.charAt(0).toLowerCase() +
      ".png";
    modal.querySelector(".wrap-profile > img").classList.remove("hide");
  }

  if (filteredStudent.prefect) {
    document.querySelector("h3.prefected").textContent =
      "Prefect of " + filteredStudent.house + " house";
    document.querySelector("#prefectButton").classList.add("hide");
    document.querySelector("#prefectRevokeButton").classList.remove("hide");
  } else {
    document.querySelector("h3.prefected").textContent = "";
    document.querySelector("#prefectButton").classList.remove("hide");
    document.querySelector("#prefectRevokeButton").classList.add("hide");
  }

  if (prefectCounter.Slytherin >= 2) {
    document.querySelector("#prefectButton").disabled = true;
  } else if (prefectCounter.Gryffindor >= 2) {
    document.querySelector("#prefectButton").disabled = true;
  } else if (prefectCounter.Ravenclaw >= 2) {
    document.querySelector("#prefectButton").disabled = true;
  } else if (prefectCounter.Hufflepuff >= 2) {
    document.querySelector("#prefectButton").disabled = true;
  }

  if (filteredStudent.bloodStatus == "pure") {
    document.querySelector(".blood-status").textContent = "Blood-Status: Pure";
  } else if (filteredStudent.bloodStatus == "half") {
    document.querySelector(".blood-status").textContent = "Blood-Status: Half";
  } else {
    document.querySelector(".blood-status").textContent =
      "Blood-Status: Unknown";
  }

  if (filteredStudent.bloodStatus == "pure") {
    document.querySelector("#inquisitorialButton").disabled = false;
  } else if (filteredStudent.house == "Slytherin") {
    document.querySelector("#inquisitorialButton").disabled = false;
  }

  if (filteredStudent.inquisitorial == true) {
    document.querySelector("h3.inquisitorial").textContent =
      "Member of Inquistorial Squad";
    document.querySelector("#inquisitorialButton").classList.add("hide");
    document
      .querySelector("#inquisitorialRevokeButton")
      .classList.remove("hide");
  } else {
    document.querySelector("h3.inquisitorial").textContent = "";
    document.querySelector("#inquisitorialButton").classList.remove("hide");
    document.querySelector("#inquisitorialRevokeButton").classList.add("hide");
  }

  if (filteredStudent.expelled) {
    document.querySelector("#expellButton").disabled = true;
    document.querySelector("#prefectButton").disabled = true;
    document.querySelector("h5.expelled").classList.remove("hide");
    document.querySelector("#inquisitorialButton").disabled = true;
  } else {
    document.querySelector("#expellButton").disabled = false;
  }

  mixBlood(filteredStudent.firstname);
  modal.classList.remove("hide");
}



function filterOut() {
  if (dropdown.value == "All") {
    filteredData = usableData;
    displayData(filteredData);
  } else if (dropdown.value == "Expelled") {
    filteredData = usableData.filter(
      studentObject => studentObject.expelled === true
    );
    filteredData = expelledData;
    displayData(filteredData);
  } else {
    filteredData = usableData.filter(
      studentObject => studentObject.house === dropdown.value
    );
    displayData(filteredData);
  }
  document.querySelector("#reverse").disabled = true;
}


//first name 

function sortByFirst() {
  filteredData = filteredData.sort(function(a, b) {
    return a.firstname.localeCompare(b.firstname);
  });
  displayData(filteredData);
  document.querySelector("#reverse").disabled = false;
}

//last name

function sortByLast() {
  filteredData = filteredData.sort(function(a, b) {
    return a.lastname.localeCompare(b.lastname);
  });
  displayData(filteredData);
  document.querySelector("#reverse").disabled = false;
}



function reverseArray() {
  filteredData = filteredData.reverse();
  displayData(filteredData);
}

//remove from the list and add to expelled list

function expell() {
  for (let counter = 0; counter < usableData.length; counter++) {
    if (usableData[counter].firstname === "Monika") {
    } else if (usableData[counter].firstname === event.target.value) {
      usableData[counter].expelled = true;
      usableData[counter].prefect = false;
      usableData[counter].inquisitorial = false;
      expelledData.push(usableData[counter]);
      usableData.splice(counter, 1);
      filteredData = usableData;
    }
  }
  if (event.target.value === "Monika") {
    alert("Crucio");
  } else {
    document.querySelector("h3.prefected").textContent = "";
    document.querySelector("h3.inquisitorial").textContent = "";
    document.querySelector("#optionExpelled").classList.remove("hide");
    document.querySelector("#expellButton").disabled = true;
    document.querySelector("#prefectButton").disabled = true;
    document.querySelector("#inquisitorialButton").disabled = true;
    document.querySelector("h5.expelled").classList.remove("hide");
    modal.classList.add("hide");
    displayData(filteredData);
  }
}

//prefects

function prefect() {
  for (let counter = 0; counter < usableData.length; counter++) {
    if (usableData[counter].firstname === event.target.value) {
      usableData[counter].prefect = true;
      filteredData = usableData;

      document.querySelector("h3.prefected").textContent =
        "Prefect of " + usableData[counter].house + " house";

      if (usableData[counter].house == "Slytherin") {
        prefectCounter.Slytherin++;
      } else if (usableData[counter].house == "Gryffindor") {
        prefectCounter.Gryffindor++;
      } else if (usableData[counter].house == "Hufflepuff") {
        prefectCounter.Hufflepuff++;
      } else if (usableData[counter].house == "Ravenclaw") {
        prefectCounter.Ravenclaw++;
      }
    }
  }
  document.querySelector("#prefectButton").classList.add("hide");
  document.querySelector("#prefectRevokeButton").classList.remove("hide");
}

//removes prefect and keeps track of prefects

function revokePrefect() {
  for (let counter = 0; counter < usableData.length; counter++) {
    if (usableData[counter].firstname === event.target.value) {
      usableData[counter].prefect = false;
      filteredData = usableData;

      document.querySelector("h3.prefected").textContent = "";

      if (usableData[counter].house == "Slytherin") {
        prefectCounter.Slytherin--;
      } else if (usableData[counter].house == "Gryffindor") {
        prefectCounter.Gryffindor--;
      } else if (usableData[counter].house == "Hufflepuff") {
        prefectCounter.Hufflepuff--;
      } else if (usableData[counter].house == "Ravenclaw") {
        prefectCounter.Ravenclaw--;
      }
    }
  }
  document.querySelector("#prefectButton").classList.remove("hide");
  document.querySelector("#prefectRevokeButton").classList.add("hide");
}

//blood status

function defineBloodStatus(BloodTypes) {
  for (let [key, value] of Object.entries(BloodTypes)) {
    for (let i = 0; i < value.length; i++) {
      for (let j = 0; j < usableData.length; j++) {
        const lastname = usableData[j].lastname;
        if (usableData[j].lastname === value[i]) {
          usableData[j].bloodStatus = key;
        }
      }
    }
  }
}

//inquisitorial

function inquisitorialize() {
  let secondaryCntr;
  for (let counter = 0; counter < usableData.length; counter++) {
    if (usableData[counter].firstname === event.target.value) {
      usableData[counter].inquisitorial = true;
      filteredData = usableData;
      secondaryCntr = counter;
    }
  }
  document.querySelector("h3.inquisitorial").textContent =
    "Member of Inquistorial Squad";
  document.querySelector("#inquisitorialButton").classList.add("hide");
  document.querySelector("#inquisitorialRevokeButton").classList.remove("hide");
  setTimeout(function() {
    usableData[secondaryCntr].inquisitorial = false;
    filteredData = usableData;
    document.querySelector("h3.inquisitorial").textContent = "";
    document.querySelector("#inquisitorialButton").classList.remove("hide");
    document.querySelector("#inquisitorialRevokeButton").classList.add("hide");
    alert("oops");
  }, 3000);
}

//remove from inquisitorial

function deInquisitorialize() {
  for (let counter = 0; counter < usableData.length; counter++) {
    if (usableData[counter].firstname === event.target.value) {
      usableData[counter].inquisitorial = false;
      filteredData = usableData;
    }
  }
  document.querySelector("h3.inquisitorial").textContent = "";
  document.querySelector("#inquisitorialButton").classList.remove("hide");
  document.querySelector("#inquisitorialRevokeButton").classList.add("hide");
}

//adds me

function hackTheSystem() {
  let me = Object.create(protoStudent);
  me.firstname = "Monika";
  me.lastname = "Dimitrova";
  me.nickname = "MNC";
  me.house = "Gryffindor";
  me.middlename = "Rumenova";

  usableData.push(me);
  filteredData = usableData;
}

//function that displays the blood data of every student wrong way

function mixBlood(target) {
  for (let counter = 0; counter < usableData.length; counter++) {
    if (target == usableData[counter].firstname) {
      if (usableData[counter].bloodStatus == "half") {
        document.querySelector(".blood-status").textContent =
          "Blood-Status: Pure";
      } else if (usableData[counter].bloodStatus == "pure") {
        document.querySelector(".blood-status").textContent =
          "Blood-Status: Half";
      } else if (usableData[counter].bloodStatus == false) {
        document.querySelector(".blood-status").textContent =
          "Blood-Status: Pure";
      }
    }
  }
}
