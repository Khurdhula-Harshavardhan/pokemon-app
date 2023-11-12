import React from 'react';
import html2canvas from 'html2canvas';

function Card({ data }) {
  const downloadCard = () => {
    // Use html2canvas to take a screenshot of the current component
    html2canvas(document.querySelector(`#card-${data.id}`))
      .then((canvas) => {
        // Create an image from the canvas
        const image = canvas.toDataURL('image/png');

        // Create a link to download the image
        const link = document.createElement('a');
        link.href = image;
        link.download = `${data.name}.png`;

        // Append to the DOM, trigger the download, and remove from the DOM
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(err => {
        console.error('Error downloading the card:', err);
      });
  };

  return (
    <div className="pokemon-card" id={`card-${data.id}`} onClick={downloadCard}>
      <img src={data.image} alt={data.name} />
      <h3>{data.name}</h3>
      <p><strong>Type: {data.type}</strong></p>
    </div>
  );
}

export default Card;
