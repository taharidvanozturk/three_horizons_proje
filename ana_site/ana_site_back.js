axios.get('https://btk-maraton.obs.myhuaweicloud.com/')
  .then(function (response) {
    const xmlContent = response.data; // XML içeriği

    // XML içeriğini işlemek için bir DOMParser oluşturun
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');

    // <Key> etiketlerini içeren tüm öğeleri seçin
    const keyElements = xmlDoc.querySelectorAll('Key');
    const imageContainer = document.getElementById('image-container');

    // Her <Key> öğesini işleyerek resim URL'lerini alın ve resimleri sayfada gösterin
    keyElements.forEach(function (keyElement) {
      const imageUrl = keyElement.textContent;
      const imgElement = document.createElement('img');
      imgElement.src = `https://btk-maraton.obs.myhuaweicloud.com/${imageUrl}`;
      imgElement.classList.add('col-md-4'); // Bootstrap 4 için bir sütun sınıfı ekleyin
      imageContainer.appendChild(imgElement);
      console.log("Image URL:", imgElement.src);

    });
  })
  .catch(function (error) {
    console.log(error);
  });
