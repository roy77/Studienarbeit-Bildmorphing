//Klasse Punkt 
class Punkt{ 
    constructor()
    {
        this.nummer;
        this.x;
        this.y;
        this.wirdGezogen = false;
        this.radius=5;
        this.farbe="black";   
    }

    angewählt(px,py)
    {   
        var d = this.abstandRechnen(px, py, this.x, this.y);
        if (d < this.radius+10)
        {
            this.wirdGezogen = true;
            this.farbe = "red"; 
        }
    }

    abstandRechnen(PunktX, PunktY, MausX, MausY)
    {
        return Math.sqrt(Math.pow((PunktX-MausX),2)+Math.pow((PunktY-MausY),2));
    }
}

class BildBox
{
    constructor()
    {
        this.bild = new Image();
        this.teilverhältnis = 4;
        this.xz=0;
        this.yz=0;
        this.Punkte = [];
        this.canvasX;
        this.canvasY;   
        this.startX;
        this.startY;
    }

    init(canvasID,imageSRC) 
    {
        //Canvas und Bilder initialisieren
        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.font = "16px Arial";

        //Alles zurücksetzen
        this.Punkte = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.bild.src = imageSRC;

        //Maße des Canvas initialisieren
        this.canvas.height= this.bild.height;
        this.canvas.width= this.bild.width;

        //Bild zeichnen
        this.bild.onload = this.bildzeichnen.bind(this);
                
        //initialer Aufruf der Netz-Zeichenfunktionen
        this.punkteerstellen(); 
        this.rechneKoordianten();
        this.punktezeichnen();
        this.gitterzeichnen();
        
        //Evente definieren
        this.canvas.addEventListener('mouseup', this.onmouseup.bind(this)); 
        this.canvas.addEventListener('mouseout', this.onmouseout.bind(this)); 
        this.canvas.addEventListener('mousedown', this.onmousedown.bind(this));
        this.canvas.addEventListener('mousemove', this.onmousemove.bind(this));        
    }

    //Eventfunktionen
    onmouseup()
    { 
        for(let i=1; i< this.Punkte.length; i++)
        {
            if (this.Punkte[i].wirdGezogen)
            {
                this.Punkte[i].farbe = "black";
                this.Punkte[i].wirdGezogen = false;
            } 
        }
    }

    onmouseout()
    { 
        for(let i=1; i< this.Punkte.length; i++)
        {
            if (this.Punkte[i].wirdGezogen)
            {
                this.Punkte[i].farbe = "black";
                this.Punkte[i].wirdGezogen = false;
            }
        } 
    }

    onmousedown()
    {   
        this.startX = this.canvasX;
        this.startY = this.canvasY;
        for(let i=1; i < this.Punkte.length; i++)
        {   if (i != 1 && i != 5 && i != 21 && i != 25)
            this.Punkte[i].angewählt(this.canvasX,this.canvasY);
        }

        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.bildzeichnen();
    }

    onmousemove(e)
    { 
        //Mausbewegung ausrechnen
        var cRect = this.canvas.getBoundingClientRect();        
        this.canvasX = Math.round(e.clientX - cRect.left);     
        this.canvasY = Math.round(e.clientY - cRect.top);

        for(let i=1; i < this.Punkte.length; i++)
        {   
            //Punkte verschieben und Bild neuzeichnen
            if (this.Punkte[i].wirdGezogen)
            {               
            
                    var deltax = this.canvasX - this.startX;
                    var deltay = this.canvasY - this.startY;
           
                    this.Punkte[i].x = this.startX + deltax;
                    this.Punkte[i].y = this.startY + deltay;
                  
                    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
                    this.bildzeichnen();
            } 
        }

        //Event nach außen erzeugen
        dispatchEvent(new CustomEvent('Uebergabe', 
        {
            //Übergabeinformationen definieren
            detail:
            {
                sender: this.canvas.id,
                Punkte : this.Punkte,
                Bild : this.bild, 
                teilverhältnis :this.teilverhältnis 
            }
        })); 

    }

        //Funktionen
    //Bildkoordinaten anhand von Bildmaßen und Teilververhältnis für die Punkte errechnen
    rechneKoordianten()
    {       
        for(let i=1;i<=(this.teilverhältnis+1)*(this.teilverhältnis+1);i++)
        {    
            if(this.xz >= this.teilverhältnis + 1)
            {
                this.xz = 0;  
                this.yz ++;
            }
            this.Punkte[i].nummer = i;
            this.Punkte[i].x = this.xz*this.canvas.width / this.teilverhältnis;
            this.Punkte[i].y = this.yz*this.canvas.height / this.teilverhältnis;
            this.xz++;        
            }
        return this;
    }

    //Array mit Objekten der Klasse Punkt erstellen
    punkteerstellen()
    {
        for(let i=1;i<=Math.pow(this.teilverhältnis+1,2);i++)
        { 
            this.Punkte[i] = new Punkt;
            this.Punkte[i].nummer=i;
        }
    }

    //Punkte in den Canvas einzeichnen
    punktezeichnen()
    {
        for(let i=1; i<=Math.pow(this.teilverhältnis+1,2); i++)
        {
            this.ctx.beginPath();
            this.ctx.arc(this.Punkte[i].x, this.Punkte[i].y, this.Punkte[i].radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = this.Punkte[i].farbe
            this.ctx.fill();
        }
    } 

    //Punkte zu Gitter verbinden
    gitterzeichnen()
    {   //horizontal
        for(let i=1; i<=Math.pow(this.teilverhältnis+1,2); i++)
        {
            if(this.Punkte[i].nummer % (this.teilverhältnis+1) != 0 )
            {
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 0;
                this.ctx.moveTo(this.Punkte[i].x, this.Punkte[i].y)
                this.ctx.lineTo(this.Punkte[i+1].x, this.Punkte[i+1].y);
                this.ctx.stroke();
            }
        }
        //vertikal
        for(let i=1; i<=(Math.pow(this.teilverhältnis+1,2))-this.teilverhältnis-1; i++)
        {
            {
                this.ctx.moveTo(this.Punkte[i].x, this.Punkte[i].y)
                this.ctx.lineTo(this.Punkte[i+this.teilverhältnis+1].x, this.Punkte[i+this.teilverhältnis+1].y);
                this.ctx.stroke();
            }
        }

        this.k = 0;
        //diagonal
        for(let i=1; i<20; i++)
        {
            switch (i)
            {
                case 5:
                    this.k++;
                    break;
                case 10:
                    this.k++;
                    break;
        
                case 15:
                    this.k++;
                    break;
                default:
                    this.k++;
                    {
                        this.ctx.moveTo(this.Punkte[this.k].x, this.Punkte[this.k].y)
                        this.ctx.lineTo(this.Punkte[this.k+this.teilverhältnis+2].x, this.Punkte[this.k+this.teilverhältnis+2].y);
                        this.ctx.stroke();
                    }
                    break;
            }
            

        }
    }

    //Bild in Canvas einzeichnen
    bildzeichnen()
    { 
        this.ctx.drawImage(this.bild,1, 1, this.canvas.width, this.canvas.height);
        this.punktezeichnen();
        this.gitterzeichnen(); 

        return this.bild;
    }
}

 class Morphing
{
    constructor()
    {
        this.Box1;
        this.Box2;
        this.Punkte1 = [];
        this.Punkte2 = [];
        this.Bild1 = new Image();
        this.Bild2 = new Image();
        this.canvas;
        this.ZielCanvas1;
        this.ZielCanvas2;
        this.ctx;
        this.teilverhältnis;
        this.Bildausschnitte = [];
        this.j = 1;
    }

    //Initialisierung der Klasse
    init(canvasID, ZielCanvas1, ZielCanvas2)
    {
        //Dieser Canvas wird nur verwendet für die Segmente, kann ausgeblendet werden
        this.canvas = document.getElementById(canvasID);
        //this.canvas.style.display="none";  
        this.ctx = this.canvas.getContext('2d');
        this.ctx.font = "16px Arial";

        this.ZielCanvas1 = document.getElementById(ZielCanvas1);
        this.Ziel_ctx1 = this.canvas.getContext('2d');
        this.Ziel_ctx1.font = "16px Arial";

        this.ZielCanvas2 = document.getElementById(ZielCanvas2);
        this.Ziel_ctx2 = this.canvas.getContext('2d');
        this.Ziel_ctx1.font = "16px Arial";

        return this;
    }

    //Übertragung der Daten aus den anderen BildBoxen
    uebertragen(canvasID,PunkteAusBildBox,BildAusBildBox,TeilverhältnisAusBoxen) 
    {
        this.teilverhältnis = TeilverhältnisAusBoxen;

        if(canvasID == 'canvas_1')
        {
            this.Punkte1 = [...PunkteAusBildBox];
            this.Bild1 = BildAusBildBox;
        }
        
        if(canvasID == 'canvas_2')
        {
            this.Punkte2 = [...PunkteAusBildBox];
            this.Bild2 = BildAusBildBox;
        }
    }

    transformiereAusschnitte(Quellraster, Zielraster, Quellbild, Zielbild)
    {   this.canvas.width = Quellbild.width;
        this.canvas.height = Quellbild.height;
        let maskCanvas = document.getElementById("canvas_8");
        maskCanvas.width = this.canvas.width;
        maskCanvas.height = this.canvas.height;
        let maskCtx = maskCanvas.getContext("2d");
        let src = cv.imread(Quellbild);
        this.z1 = 0;
        this.z2 = 16;

        //obere Dreiecke
        this.j = 0;
        for(let z=1; z<=16; z++)
        {   
            maskCtx.globalCompositeOperation = "source-over";
            this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
            maskCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            //später noch an das Teilverhältnis anpassen
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
        let srcTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Quellraster[this.j].x, Quellraster[this.j].y, Quellraster[this.j+1].x, Quellraster[this.j+1].y, Quellraster[this.j+6].x, Quellraster[this.j+6].y]);
        let dstTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Zielraster[this.j].x, Zielraster[this.j].y, Zielraster[this.j+1].x, Zielraster[this.j+1].y, Zielraster[this.j+6].x, Zielraster[this.j+6].y]);
        //Transformationsmatrix berechnen
        let kernel = cv.getAffineTransform(srcTri, dstTri);
        //Transformation durchführen
        cv.warpAffine(src, dst, kernel, new cv.Size(Zielbild.width, Zielbild.height), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());          
        cv.imshow(this.canvas, dst);		
        //src.delete();
        dst.delete();

        //Dreieck zur Maskierung zeichnen
        maskCtx.lineWidth = 1;
        maskCtx.beginPath();
        maskCtx.moveTo(Zielraster[this.j].x+1, Zielraster[this.j].y+1);
        maskCtx.lineTo(Zielraster[this.j+1].x-1, Zielraster[this.j+1].y+1);
        maskCtx.lineTo(Zielraster[this.j+6].x-1, Zielraster[this.j+6].y)-1;
        maskCtx.closePath();
        maskCtx.stroke();
        maskCtx.fill();
 
        //zur Segmentierung das Bild in die Maske zeichnen
        maskCtx.globalCompositeOperation = "source-in";
        maskCtx.drawImage(this.canvas, 0, 0);

        //Segmente einlesen und abspeichern
        this.Bildausschnitte[this.z1] = cv.imread(maskCanvas);
        }

        //untere Dreiecke
        this.l = 0;
        for(let z=1; z<=16; z++)
        {   
            maskCtx.globalCompositeOperation = "source-over";
            this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
            maskCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            //später noch an das Teilverhältnis anpassen
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
        let srcTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Quellraster[this.l].x, Quellraster[this.l].y, Quellraster[this.l+5].x, Quellraster[this.l+5].y, Quellraster[this.l+6].x, Quellraster[this.l+6].y]);
        let dstTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Zielraster[this.l].x, Zielraster[this.l].y, Zielraster[this.l+5].x, Zielraster[this.l+5].y, Zielraster[this.l+6].x, Zielraster[this.l+6].y]);
        //Transformationsmatrix berechnen
        let kernel = cv.getAffineTransform(srcTri, dstTri);
        //Transformation durchführen
        cv.warpAffine(src, dst, kernel, new cv.Size(Zielbild.width, Zielbild.height), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());          
        cv.imshow(this.canvas, dst);	
       // src.delete();
        dst.delete();

        //Dreieck zur Maskierung zeichnen
        maskCtx.lineWidth = 1;
        maskCtx.beginPath();
        maskCtx.moveTo(Zielraster[this.l].x, Zielraster[this.l].y);
        maskCtx.lineTo(Zielraster[this.l+5].x, Zielraster[this.l+5].y);
        maskCtx.lineTo(Zielraster[this.l+6].x, Zielraster[this.l+6].y);
        maskCtx.closePath();
        maskCtx.stroke();
        maskCtx.fill();

        //zur Segmentierung das Bild in die Maske zeichnen 
        maskCtx.globalCompositeOperation = "source-in";
        maskCtx.drawImage(this.canvas, 0, 0);

        //Segmente einlesen und abspeichern
        this.Bildausschnitte[this.z2] =cv.imread(maskCanvas);
        }

        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        maskCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let src1 = cv.imread(maskCanvas)
        let dsrc = new cv.Mat();

        //Bildausschnitte zum Gesamtbild aufaddieren 
        for(let i=1; i<=32;i++)
        {
            let src2 = this.Bildausschnitte[i];  
            cv.add(src1, src2, dsrc);
            src1 = dsrc;
        }
        //Ergebnisbild ausgeben
        cv.imshow(maskCanvas,dsrc,0,0);

        //Weiße Pixel im Bild durch Nachbarn ersetzen
        let Bilddaten = new ImageData(Quellbild.width, Quellbild.height);
        let gefilterteBilddaten = new ImageData(Quellbild.width, Quellbild.height);
        Bilddaten = maskCtx.getImageData(0,0,Quellbild.width,Quellbild.height);
        gefilterteBilddaten = this.WeißePixelManipulieren(Bilddaten);
        maskCtx.putImageData(gefilterteBilddaten,0,0);

    }

    WeißePixelManipulieren(pixel)
    {   var pixeldata = pixel.data
        let maskCanvas = document.getElementById("canvas_8");
        maskCanvas.width = this.canvas.width;
        maskCanvas.height = this.canvas.height;
        let maskCtx = maskCanvas.getContext("2d");

        for(let i=0; i<pixeldata.length; i+=4)
        { //console.log(pixeldata)
            if(pixeldata[i]>=254 || pixeldata[i+1]>=254 || pixeldata[i+2]>=254 )
            { console.log(pixeldata[i])
                pixeldata[i] = pixeldata[i+4];     // red
                pixeldata[i + 1] = pixeldata[i+5]; // green
                pixeldata[i + 2] = pixeldata[i+6]; // blue
                pixeldata[i + 3] = 255;
            }

            if((pixeldata[i]>=254 || pixeldata[i+1]>=254 || pixeldata[i+2]>=254) && (pixeldata[i+4]>=254 || pixeldata[i+5]>=254 || pixeldata[i+6]>=254))
            { console.log(pixeldata[i+4*maskCanvas.width])
                pixeldata[i] = pixeldata[i+4+4*maskCanvas.width];     // red
                pixeldata[i + 1] = pixeldata[i+5+4*maskCanvas.width]; // green
                pixeldata[i + 2] = pixeldata[i+6+4*maskCanvas.width]; // blue
                pixeldata[i + 3] = 255;
            }

            if((pixeldata[i]>=254 || pixeldata[i+1]>=254 || pixeldata[i+2]>=254) && (pixeldata[i+4]>=254 || pixeldata[i+5]>=254 || pixeldata[i+6]>=254) && (pixeldata[i+8]>=254 || pixeldata[i+9]>=254 || pixeldata[i+10]>=254))
            { console.log(pixeldata[i+4*maskCanvas.width])
                pixeldata[i] = pixeldata[i+4+4*maskCanvas.width];     // red
                pixeldata[i + 1] = pixeldata[i+5+4*maskCanvas.width]; // green
                pixeldata[i + 2] = pixeldata[i+6+4*maskCanvas.width]; // blue
                pixeldata[i + 3] = 255;
            }
        }
        console.log(pixel)
        maskCtx.putImageData(pixel, 0, 0);
        return pixel;
    }

    abstandRechnen(Punkt1X, Punkt1Y, Punkt2X, Punkt2Y)
    {
        return Math.sqrt(Math.pow((Punkt1X-Punkt2X),2)+Math.pow((Punkt1Y-Punkt2Y),2));
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
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                // Pixel muss im Feld liegen
                if (y + i >= 0 && y + i < height && x + j >= 0 && x + j < width) {
                    let pixelIndex = (y + i) * width * 4 + (x + j) * 4;
                    neighborhood.push(data[pixelIndex]);
                }
                }
            }
            neighborhood.sort();
            //medianisieren
            let median = neighborhood[Math.floor(neighborhood.length / 2)];

            
            let filteredPixelIndex = y * width * 4 + x * 4;
            filteredData[filteredPixelIndex] = data[filteredPixelIndex];//median;
            filteredData[filteredPixelIndex + 1] = data[filteredPixelIndex+1]; //median;
            filteredData[filteredPixelIndex + 2] = data[filteredPixelIndex+2];//median;
            filteredData[filteredPixelIndex + 3] = 255;
            }
        }
        return filteredImageData;
        }
} 