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
        this.punkteerstellen(this.Punkte); 
        this.rechneKoordianten(this.Punkte);
        this.punktezeichnen(this.Punkte);
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
    rechneKoordianten(Punkte)
    {       
        for(let i=1;i<=(this.teilverhältnis+1)*(this.teilverhältnis+1);i++)
        {    
            if(this.xz >= this.teilverhältnis + 1)
            {
                this.xz = 0;  
                this.yz ++;
            }
            Punkte[i].nummer = i;
            Punkte[i].x = this.xz*this.canvas.width / this.teilverhältnis;
            Punkte[i].y = this.yz*this.canvas.height / this.teilverhältnis;
            this.xz++;        
            }
        return this;
    }

    //Array mit Objekten der Klasse Punkt erstellen
    punkteerstellen(Punkte)
    {
        for(let i=1;i<=Math.pow(this.teilverhältnis+1,2);i++)
        { 
            Punkte[i] = new Punkt;
            Punkte[i].nummer=i;
        }
        return Punkte;
    }

    //Punkte in den Canvas einzeichnen
    punktezeichnen(Punkte)
    {
        for(let i=1; i<=Math.pow(this.teilverhältnis+1,2); i++)
        {
            this.ctx.beginPath();
            this.ctx.arc(Punkte[i].x, Punkte[i].y, Punkte[i].radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = Punkte[i].farbe
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
        this.punktezeichnen(this.Punkte);
        this.gitterzeichnen(); 

        return this.bild;
    }
}