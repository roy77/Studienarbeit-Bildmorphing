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
        this.canvas.style.display="none";  
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
    {  
        this.z1 = 0;
        this.z2 = 16;
        //obere Dreiecke
        this.j = 0;
        for(let z=1; z<=16; z++)  //z<=Math.pow(this.teilverhältnis,2)
        {   //später noch an das Teilverhältnis anpassen
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
        let src = cv.imread(Quellbild); //direkt das Bild laden
        let dst = new cv.Mat();         //Matrix für das Ziel erstellen
        //Quell- und Zielpunkte abhängig von den Punktearrays als Eingabewerte
        let srcTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Quellraster[this.j].x, Quellraster[this.j].y, Quellraster[this.j+1].x, Quellraster[this.j+1].y, Quellraster[this.j+6].x, Quellraster[this.j+6].y]);
        let dstTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Zielraster[this.j].x, Zielraster[this.j].y, Zielraster[this.j+1].x, Zielraster[this.j+1].y, Zielraster[this.j+6].x, Zielraster[this.j+6].y]);
        //Transformationsmatrix berechnen
        let kernel = cv.getAffineTransform(srcTri, dstTri);
        //Transformation durchführen
        cv.warpAffine(src, dst, kernel, new cv.Size(Zielbild.width, Zielbild.height), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());          
        cv.imshow(this.canvas, dst);	//gleicher Zwischencanvas wird für das Erstellen und Extrahieren der Ausschnitte verwendet	
        src.delete();
        dst.delete();

        //Rest vom Zwischencanvas schwarz überzeichnen
        this.zeichnePolygon(Zielraster[1].x, Zielraster[1].y, Zielraster[5].x, Zielraster[5].y, Zielraster[this.j+1].x, Zielraster[this.j+1].y, Zielraster[this.j].x, Zielraster[this.j].y);
        this.zeichnePolygon(Zielraster[this.j+1].x, Zielraster[this.j+1].y, Zielraster[5].x, Zielraster[5].y, Zielraster[25].x, Zielraster[25].y, Zielraster[this.j+6].x, Zielraster[this.j+6].y);
        this.zeichnePolygon(Zielraster[this.j].x, Zielraster[this.j].y, Zielraster[this.j+6].x, Zielraster[this.j+6].y, Zielraster[25].x, Zielraster[25].y, Zielraster[21].x, Zielraster[21].y);
        this.zeichnePolygon(Zielraster[1].x, Zielraster[1].y, Zielraster[this.j].x, Zielraster[this.j].y, Zielraster[this.j+6].x, Zielraster[this.j+6].y, Zielraster[21].x, Zielraster[21].y);
        
        //Bildsegmnete in separaten Array speichern
        this.Bildausschnitte[this.z1] = cv.imread(this.canvas);
        }

        //untere Dreiecke
        this.l = 0;
        for(let z=1; z<=16; z++)
        {   //später noch an das Teilverhältnis anpassen
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
        let src = cv.imread(Quellbild); //direkt das Bild laden
        let dst = new cv.Mat();         //Matrix für das Ziel erstellen
        //Quell- und Zielpunkte abhängig von den Punktearrays als Eingabewerte
        let srcTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Quellraster[this.l].x, Quellraster[this.l].y, Quellraster[this.l+6].x, Quellraster[this.l+6].y, Quellraster[this.l+5].x, Quellraster[this.l+5].y]);
        let dstTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Zielraster[this.l].x, Zielraster[this.l].y, Zielraster[this.l+6].x, Zielraster[this.l+6].y, Zielraster[this.l+5].x, Zielraster[this.l+5].y]);
        //Transformationsmatrix berechnen
        let kernel = cv.getAffineTransform(srcTri, dstTri);
        //Transformation durchführen
        cv.warpAffine(src, dst, kernel, new cv.Size(Zielbild.width, Zielbild.height), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());          
        cv.imshow(this.canvas, dst);	//gleicher Zwischencanvas wird für das Erstellen und Extrahieren der Ausschnitte verwendet	
        src.delete();
        dst.delete();

        //Rest vom Zwischencanvas schwarz überzeichnen
        this.zeichnePolygon(Zielraster[1].x, Zielraster[1].y, Zielraster[5].x, Zielraster[5].y, Zielraster[this.l+6].x, Zielraster[this.l+6].y, Zielraster[this.l].x, Zielraster[this.l].y);
        this.zeichnePolygon(Zielraster[this.l].x, Zielraster[this.l].y, Zielraster[5].x, Zielraster[5].y, Zielraster[25].x, Zielraster[25].y, Zielraster[this.l+6].x, Zielraster[this.l+6].y);
        this.zeichnePolygon(Zielraster[this.l+5].x, Zielraster[this.l+5].y, Zielraster[this.l+6].x, Zielraster[this.l+6].y, Zielraster[25].x, Zielraster[25].y, Zielraster[21].x, Zielraster[21].y);
        this.zeichnePolygon(Zielraster[1].x, Zielraster[1].y, Zielraster[this.l].x, Zielraster[this.l].y, Zielraster[this.l+5].x, Zielraster[this.l+5].y, Zielraster[21].x, Zielraster[21].y);
        
        //Bildsegmnete in separaten Array speichern
        this.Bildausschnitte[this.z2] = cv.imread(this.canvas);
        }
    }

    addiereAusschnitte(Zielbild, ZielCanvas, Ziel_ctx)
    {   //Canvasmaße initialisieren
        ZielCanvas.width = Zielbild.width;
        ZielCanvas.height = Zielbild.height;
        //Canvas schwarz überzeichnen, da sonst Addition des ersten Bildes fehlerhaft
        Ziel_ctx.rect(0,0, Zielbild.width, Zielbild.height);
        Ziel_ctx.fillStyle = "black";
        Ziel_ctx.fill();

        //es wird immer der Zielcanvas eingelesen und ein Bildausschnitt hinzuaddiert
         for(let i=1; i<=32; i++)
        {
            let src1 = cv.imread(ZielCanvas);
            let src2 = this.Bildausschnitte[i];
            let dst = new cv.Mat();
                
            cv.add(	src1, src2, dst);
            cv.imshow(ZielCanvas,dst);
        } 
    }

    //Schwarze Polygone um das Zielsegment zeichnen
    zeichnePolygon(P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y)
    {
        this.ctx.fillStyle = "black";
        
        this.ctx.beginPath();
        this.ctx.moveTo(P1x, P1y);  
        this.ctx.lineTo(P2x, P2y);
        this.ctx.stroke();  
        this.ctx.lineTo(P3x, P3y); 
        this.ctx.stroke();  
        this.ctx.lineTo(P4x, P4y); 
        this.ctx.stroke();
        this.ctx.closePath(); 
        this.ctx.stroke();     
        this.ctx.fill();
    }  
   
    abstandRechnen(Punkt1X, Punkt1Y, Punkt2X, Punkt2Y)
    {
        return Math.sqrt(Math.pow((Punkt1X-Punkt2X),2)+Math.pow((Punkt1Y-Punkt2Y),2));
    }     
} 
