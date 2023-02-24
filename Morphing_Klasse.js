class Morphing
{
    constructor()
    {
        this.Box1;
        this.Box2;
        this.QuellpunkteM = [];
        this.ZielpunkteM = [];
        this.Bild1 = new Image();
        this.Bild2 = new Image();
        this.width;
        this.height;
        this.maskCanvas;
        this.maskCtx;
        this.TransformationsCanvas;
        this.TransformationCtx;
        this.teilverhältnis;
        this.Bildausschnitte = [];
        this.j = 1;
    }

    //Initialisierung der Klasse
    init(TransformationsCanvasID, maskCanvasID, width, height)
    {
        this.width = width;
        this.height = height;

        //Dieser Canvas wird verwendet für die Zwischentransformation, kann ausgeblendet werden
        this.TransformationsCanvas = document.getElementById(TransformationsCanvasID);
        this.TransformationsCanvas.style.display="none";  
        this.TransformationCtx = this.TransformationsCanvas.getContext('2d');
        this.TransformationCtx.font = "16px Arial";
        this.TransformationsCanvas.width = this.width;
        this.TransformationsCanvas.height = this.height;

        //Maskencanvas wird für das Isolieren und abspeichern der Bildsegmente verwendet
        this.maskCanvas = document.getElementById(maskCanvasID);
        this.maskCanvas.style.display="none";  
        this.maskCtx = this.maskCanvas.getContext('2d');
        this.maskCtx.font = "16px Arial";
        this.maskCanvas.width = this.width;
        this.maskCanvas.height = this.height;
 
        return this;
    }

    //Übertragung der Daten aus den anderen BildBoxen
    uebertragen(canvasID,PunkteAusBildBox,BildAusBildBox,TeilverhältnisAusBoxen) 
    {
        this.teilverhältnis = TeilverhältnisAusBoxen;

        if(canvasID == 'QuellCanvas')
        {
            this.QuellpunkteM = [...PunkteAusBildBox]; //this.deepCopy(PunkteAusBildBox); 
            this.Bild1 = BildAusBildBox;
        }
        
        if(canvasID == 'ZielCanvas')
        {
            this.ZielpunkteM = [...PunkteAusBildBox]; //this.deepCopy(PunkteAusBildBox); 
            this.Bild2 = BildAusBildBox;
        }
    }

    NetzInterpolation(Quellpunkte, Zielpunkte,  n)
    {   var nz = n; 
        nz++;
        var rx=0;
        var ry=0;
        var xv;
        var yv;
        var Zwischenpunkte = []; 
        var kZwischenpunkte = this.deepCopy(Quellpunkte); 
        for(let k=0; k<n; k++)
        {   rx++; 
            ry++;
            for(let i=1; i<=25; i++)
            {   
                xv = Quellpunkte[i].x;
                yv = Quellpunkte[i].y;
                //Interpolationsrichtung bestimmen
                if(Quellpunkte[i].x > Zielpunkte[i].x)
                    rx = -rx;
                if(Quellpunkte[i].y > Zielpunkte[i].y)
                    ry = -ry;

                kZwischenpunkte[i].x = xv + rx * (Math.abs(Quellpunkte[i].x - Zielpunkte[i].x) / (nz));
                kZwischenpunkte[i].y = yv + ry * (Math.abs(Quellpunkte[i].y - Zielpunkte[i].y) / (nz));
                
                if(rx<0)
                    rx = -rx;
                if(ry<0)
                    ry = -ry;          
            }
            Zwischenpunkte[k] = this.deepCopy(kZwischenpunkte);
        } 
        return Zwischenpunkte;
    }

    transformiereAusschnitte(Quellpunkte, Zielpunkte, src)
    {  
        let transformiertesBild; 
        this.z1 = 0;
        this.z2 = 16;

        //obere Dreiecke
        this.j = 0;
        for(let z=1; z<=16; z++)
        {   
            this.maskCtx.globalCompositeOperation = "source-over";
            this.TransformationCtx.clearRect(0,0,this.width, this.height);
            this.maskCtx.clearRect(0, 0, this.width, this.height);

            switch (z)
            {
                case 5:
                    this.j+=2;
                    break;
                case 9:
                    this.j+=2;
                    break;
        
                case 13:
                    this.j+=2;
                    break;

                default:
                    this.j++;
            }
        this.z1 ++;

        //Vierpunkttransformation
        let dst = new cv.Mat();       
        //Quell- und Zielpunkte abhängig von den Punktearrays als Eingabewerte
        let srcTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Quellpunkte[this.j].x, Quellpunkte[this.j].y, Quellpunkte[this.j+1].x, Quellpunkte[this.j+1].y, Quellpunkte[this.j+6].x, Quellpunkte[this.j+6].y]);
        let dstTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Zielpunkte[this.j].x, Zielpunkte[this.j].y, Zielpunkte[this.j+1].x, Zielpunkte[this.j+1].y, Zielpunkte[this.j+6].x, Zielpunkte[this.j+6].y]);
        //Transformationsmatrix berechnen
        let kernel = cv.getAffineTransform(srcTri, dstTri);
        //Transformation durchführen
        cv.warpAffine(src, dst, kernel, new cv.Size(this.width, this.height), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());          
        cv.imshow(this.TransformationsCanvas, dst);		
        //src.delete();
        dst.delete();

        //Dreieck zur Maskierung zeichnen
        this.maskCtx.lineWidth = 1;
        this.maskCtx.beginPath();
        this.maskCtx.moveTo(Zielpunkte[this.j].x+1, Zielpunkte[this.j].y+1);
        this.maskCtx.lineTo(Zielpunkte[this.j+1].x-1, Zielpunkte[this.j+1].y+1);
        this.maskCtx.lineTo(Zielpunkte[this.j+6].x-1, Zielpunkte[this.j+6].y)-1;
        this.maskCtx.closePath();
        this.maskCtx.stroke();
        this.maskCtx.fill();
 
        //zur Segmentierung das Bild in die Maske zeichnen
        this.maskCtx.globalCompositeOperation = "source-in";
        this.maskCtx.drawImage(this.TransformationsCanvas, 0, 0);

        //Segmente einlesen und abspeichern
        this.Bildausschnitte[this.z1] = cv.imread(this.maskCanvas);
        }

        //untere Dreiecke
        this.l = 0;
        for(let z=1; z<=16; z++)
        {   
            this.maskCtx.globalCompositeOperation = "source-over";
            this.TransformationCtx.clearRect(0,0,this.width, this.height);
            this.maskCtx.clearRect(0, 0, this.width, this.height);

            switch (z)
            {
                case 5:
                    this.l+=2;
                    break;
                case 9:
                    this.l+=2;
                    break;
        
                case 13:
                    this.l+=2;
                    break;
                default:
                    this.l++;
            }
        this.z2 ++;
            
        //Vierpunkttransformation
        let dst = new cv.Mat();        
        //Quell- und Zielpunkte abhängig von den Punktearrays als Eingabewerte
        let srcTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Quellpunkte[this.l].x, Quellpunkte[this.l].y, Quellpunkte[this.l+5].x, Quellpunkte[this.l+5].y, Quellpunkte[this.l+6].x, Quellpunkte[this.l+6].y]);
        let dstTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Zielpunkte[this.l].x, Zielpunkte[this.l].y, Zielpunkte[this.l+5].x, Zielpunkte[this.l+5].y, Zielpunkte[this.l+6].x, Zielpunkte[this.l+6].y]);
        //Transformationsmatrix berechnen
        let kernel = cv.getAffineTransform(srcTri, dstTri);
        //Transformation durchführen
        cv.warpAffine(src, dst, kernel, new cv.Size(this.width, this.height), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());          
        cv.imshow(this.TransformationsCanvas, dst);	
       // src.delete();
        dst.delete();

        //Dreieck zur Maskierung zeichnen
        this.maskCtx.lineWidth = 1;
        this.maskCtx.beginPath();
        this.maskCtx.moveTo(Zielpunkte[this.l].x, Zielpunkte[this.l].y);
        this.maskCtx.lineTo(Zielpunkte[this.l+5].x, Zielpunkte[this.l+5].y);
        this.maskCtx.lineTo(Zielpunkte[this.l+6].x, Zielpunkte[this.l+6].y);
        this.maskCtx.closePath();
        this.maskCtx.stroke();
        this.maskCtx.fill();

        //zur Segmentierung das Bild in die Maske zeichnen 
        this.maskCtx.globalCompositeOperation = "source-in";
        this.maskCtx.drawImage(this.TransformationsCanvas, 0, 0);

        //Segmente einlesen und abspeichern
        this.Bildausschnitte[this.z2] =cv.imread(this.maskCanvas);
        }

        this.TransformationCtx.clearRect(0,0,this.width, this.height);
        this.maskCtx.clearRect(0, 0, this.width, this.height);

        let src1 = cv.imread(this.maskCanvas)
        let dsrc = new cv.Mat();

        //Bildausschnitte zum Gesamtbild aufaddieren 
        for(let i=1; i<=32;i++)
        {
            let src2 = this.Bildausschnitte[i];  
            cv.add(src1, src2, dsrc);
            src1 = dsrc;
        }
        //Ergebnisbild ausgeben
        cv.imshow(this.maskCanvas,dsrc,0,0);

        //Bild filtern
        let Bilddaten = new ImageData(this.width, this.height);
        let gefilterteBilddaten = new ImageData(this.width, this.height);
        Bilddaten = this.maskCtx.getImageData(0,0,this.width,this.height);
        // gefilterteBilddaten = this.removeLines(Bilddaten);
        this.maskCtx.putImageData(Bilddaten,0,0);
        transformiertesBild = cv.imread(this.maskCanvas);

        return transformiertesBild;
    }
 
    WeißePixelManipulieren(pixel)
    {   var pixeldata = pixel.data
        
        for(let i=0; i<pixeldata.length; i+=4)
        { 
            if(pixeldata[i]>=254 || pixeldata[i+1]>=254 || pixeldata[i+2]>=254 )
            {   
                //Den Wert des Pixels übernehmen, der zwei oben und zwei nach rechts geschoben ist
                pixeldata[i] = pixeldata[i+8-1*4*this.width];     // red
                pixeldata[i + 1] = pixeldata[i+9-1*4*this.width]; // green
                pixeldata[i + 2] = pixeldata[i+10-1*4*this.width]; // blue
                pixeldata[i + 3] = 255; 
            }
        }
        return pixel;
    }

    WeißePixelManipulierenV3(pixel)
    {
        var pixeldata = pixel.data

        for(let i=0; i<pixeldata.length; i+=4)
        { 
            if(pixeldata[i]>=254 || pixeldata[i+1]>=254 || pixeldata[i+2]>=254 )
            {
                pixeldata[i] = pixeldata[i+8-1*4*this.width];     // red
                pixeldata[i + 1] = pixeldata[i+9-1*4*this.width]; // green
                pixeldata[i + 2] = pixeldata[i+10-1*4*this.width]; // blue
                pixeldata[i + 3] = 255;  
            }

            
            // if((pixeldata[i]>=254 || pixeldata[i+1]>=254 || pixeldata[i+2]>=254) && (pixeldata[i+4]>=254 || pixeldata[i+5]>=254 || pixeldata[i+6]>=254))
            // { 
            //     pixeldata[i] = pixeldata[i+4+4*maskCanvas.width];     // red
            //     pixeldata[i + 1] = pixeldata[i+5+4*maskCanvas.width]; // green
            //     pixeldata[i + 2] = pixeldata[i+6+4*maskCanvas.width]; // blue
            //     pixeldata[i + 3] = 255;
            // }

            // if((pixeldata[i]>=254 || pixeldata[i+1]>=254 || pixeldata[i+2]>=254) && (pixeldata[i+4]>=254 || pixeldata[i+5]>=254 || pixeldata[i+6]>=254) && (pixeldata[i+8]>=254 || pixeldata[i+9]>=254 || pixeldata[i+10]>=254))
            // { 
            //     pixeldata[i] = pixeldata[i+4+4*maskCanvas.width];     // red
            //     pixeldata[i + 1] = pixeldata[i+5+4*maskCanvas.width]; // green
            //     pixeldata[i + 2] = pixeldata[i+6+4*maskCanvas.width]; // blue
            //     pixeldata[i + 3] = 255;
            // }



        }
        return pixel;
    }

    abstandRechnen(Punkt1X, Punkt1Y, Punkt2X, Punkt2Y)
    {
        return Math.sqrt(Math.pow((Punkt1X-Punkt2X),2)+Math.pow((Punkt1Y-Punkt2Y),2));
    }     
    
    //Hilfsfunktionen für die tiefe Arraykopie
    deepCopy(arr)
    {
        let copy = [];
        arr.forEach(elem => {
          if(Array.isArray(elem)){
            copy.push(this.deepCopy(elem))
          }else{
            if (typeof elem === 'object') {
              copy.push(this.deepCopyObject(elem))
          } else {
              copy.push(elem)
            }
          }
        })
        return copy;
    }
      
    deepCopyObject(obj)
    {
        let tempObj = {};
        for (let [key, value] of Object.entries(obj)) {
          if (Array.isArray(value)) {
            tempObj[key] = this.deepCopy(value);
          } else {
            if (typeof value === 'object') {
              tempObj[key] = this.deepCopyObject(value);
            } else {
              tempObj[key] = value
            }
          }
        }
        return tempObj;
    }

    medianFilter(imageData) 
    {
        let data = imageData.data;
        let width = imageData.width;
        let height = imageData.height;
        let filteredImageData = new ImageData(width, height);
        let filteredData = filteredImageData.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
            // 3x3 Nachbarschaftsarray erstellen
            let neighborhood = [];
            for (let i = -3; i <= 3; i++) {
                for (let j = -3; j <= 3; j++) {
                // Pixel muss im Feld liegen
                if (y + i >= 0 && y + i < height && x + j >= 0 && x + j < width) {
                    let pixelIndex = (y + i) * width * 4 + (x + j) * 4;
                    neighborhood.push(data[pixelIndex]);
                }
                }
            }
            neighborhood.sort();
            //medianisieren
            let median; //= neighborhood[Math.floor(neighborhood.length / 2)];
            let r=0;
            for(let i=0; i<=neighborhood.length;i++)
            {
                if(neighborhood[i]!=255 && neighborhood[i]!=254)
                {   r++;
                    median = median + neighborhood[i]/r;
                }
            }
            
            let filteredPixelIndex = y * width * 4 + x * 4;
            filteredData[filteredPixelIndex] = data[filteredPixelIndex];//median;
            filteredData[filteredPixelIndex + 1] = data[filteredPixelIndex+1]; //median;
            filteredData[filteredPixelIndex + 2] = data[filteredPixelIndex+2];//median;
            filteredData[filteredPixelIndex + 3] = 255;
            }
        }
        return filteredImageData;
        }

    medianFilterV2(imageData) 
    {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const result = new ImageData(width, height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const redValues = [];
            const greenValues = [];
            const blueValues = [];
            for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                if (x + i >= 0 && x + i < width && y + j >= 0 && y + j < height) {
                    const neighborIndex = (y + j) * width + x + i;
                    if (data[neighborIndex * 4] !== 255 || data[neighborIndex * 4 + 1] !== 255 || data[neighborIndex * 4 + 2] !== 255)//|| data[neighborIndex * 4] !== 254 )//|| data[neighborIndex * 4 + 1] !== 254 || data[neighborIndex * 4 + 2] !== 254) 
                    {
                    redValues.push(data[neighborIndex * 4]);
                    greenValues.push(data[neighborIndex * 4 + 1]);
                    blueValues.push(data[neighborIndex * 4 + 2]);
                    }
                }
                }
            }
            redValues.sort((a, b) => a - b);
            greenValues.sort((a, b) => a - b);
            blueValues.sort((a, b) => a - b);
            const redMedian = redValues[Math.floor(redValues.length / 2)];
            const greenMedian = greenValues[Math.floor(greenValues.length / 2)];
            const blueMedian = blueValues[Math.floor(blueValues.length / 2)];
            result.data[index] = redMedian;
            result.data[index + 1] = greenMedian;
            result.data[index + 2] = blueMedian;
            result.data[index + 3] = 255;
            }
        }

        return result;
        }

    meanFilter(imageData) 
    {
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;
            const result = new ImageData(width, height);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const values = [];
                for (let j = -1; j <= 1; j++) {
                    for (let i = -1; i <= 1; i++) {
                    if (x + i >= 0 && x + i < width && y + j >= 0 && y + j < height) {
                        const neighborIndex = (y + j) * width + x + i;
                        if (data[neighborIndex * 4] !== 255 || data[neighborIndex * 4 + 1] !== 255 || data[neighborIndex * 4 + 2] !== 255) {
                        values.push(data[neighborIndex * 4]);
                        values.push(data[neighborIndex * 4 + 1]);
                        values.push(data[neighborIndex * 4 + 2]);
                        }
                    }
                    }
                }
                const average = values.reduce((a, b) => a + b, 0) / values.length;
                result.data[index] = average;
                result.data[index + 1] = average;
                result.data[index + 2] = average;
                result.data[index + 3] = 255;
                }
            }
            return result;
            }

    meanFilterV2(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const result = new ImageData(width, height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const redValues = [];
            const greenValues = [];
            const blueValues = [];
            for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                if (x + i >= 0 && x + i < width && y + j >= 0 && y + j < height) {
                    const neighborIndex = (y + j) * width + x + i;
                    if (data[neighborIndex * 4] !== 255 || data[neighborIndex * 4 + 1] !== 255 || data[neighborIndex * 4 + 2] !== 255 || data[neighborIndex * 4] !== 254 || data[neighborIndex * 4 + 1] !== 254 || data[neighborIndex * 4 + 2] !== 254) {
                    redValues.push(data[neighborIndex * 4]);
                    greenValues.push(data[neighborIndex * 4 + 1]);
                    blueValues.push(data[neighborIndex * 4 + 2]);
                    }
                }
                }
            }
            const redAverage = redValues.reduce((a, b) => a + b, 0) / redValues.length;
            const greenAverage = greenValues.reduce((a, b) => a + b, 0) / greenValues.length;
            const blueAverage = blueValues.reduce((a, b) => a + b, 0) / blueValues.length;
            result.data[index] = redAverage;
            result.data[index + 1] = greenAverage;
            result.data[index + 2] = blueAverage;
            result.data[index + 3] = 255;
            }
        }

        return result;
        }
}