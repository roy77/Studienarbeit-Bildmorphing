    //Testumgebung für Gesichterkennung
    function Gesichtserkennung()
    { 
        // Laden des Bildes
        let img = cv.imread(BildBox1.bild);
        //Graubild
        let grayimg = new cv.Mat();
        //cv.cvtColor(img, img, cv.COLOR_RGB2BGR);
        cv.cvtColor(img, grayimg, cv.COLOR_BGR2GRAY);
        //Haarkaskade
        let faceCascade = new cv.CascadeClassifier();
        faceCascade.load('haarcascade_frontalface_default.xml');

        // Lokalisierung des Gesichts im Bild
		let faces = new cv.RectVector();
		let scaleFactor = 1.2;
		let minNeighbors = 3;
		let flags = 0;
		let minSize = new cv.Size(30, 30);
		faceCascade.detectMultiScale(grayimg, faces, scaleFactor, minNeighbors, flags, minSize);

        // Landmark-Erkennung
        // let predictor = new dlib.shape_predictor();
        // predictor.load('shape_predictor_68_face_landmarks');
        // let landmarks = predictor.predict(img, faces.get(0));

        // // Erstellen des Netz
        // let gridPoints = [];
        // for (let i = 0; i < 68; i++) {
        // gridPoints.push(new cv.Point(landmarks.get(i, 0), landmarks.get(i, 1)));
        // }
        // Verbinden der Punkte zu einem Netz
        // for (let i = 0; i < gridPoints.length - 1; i++) {
        // cv.line(img, gridPoints[i], gridPoints[i + 1], [255, 0, 0, 255], 2);
        // }

        // Anzeigen des Ergebnisses
        // cv.imshow('canvasOutput', img);
        // cv.waitKey();
    }