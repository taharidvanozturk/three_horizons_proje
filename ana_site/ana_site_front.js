document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");
    const currentTimeOffset = 3; // Adjust this offset as needed
    let currentTime = new Date();
    currentTime.setUTCHours(currentTime.getUTCHours() + currentTimeOffset);
    currentTime = currentTime.toUTCString();
    console.log("Current Time:", currentTime);    fetch('http://localhost:3000/getImagesList/.png')  // Port number is specified as 3000.
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    })
    .then(imagesList => {
        console.log("Received Images List:", imagesList); // Logging the received list

        const container = document.querySelector(".container");
        
        // Distribute images into the Bootstrap grid
        imagesList.forEach(imageName => {
            const col = document.createElement("div");
            col.classList.add("col");

            const img = document.createElement("img");
            img.src = `https://btk-maraton.obs.tr-west-1.myhuaweicloud.com/${imageName}`; // Merge with OBS link
            img.alt = "Huawei Cloud Image";
            img.classList.add("img-fluid");

            col.appendChild(img);
            container.appendChild(col);
        });
    })
    .catch(error => {
        console.error("Unable to retrieve the list of images:", error);
    });
});
