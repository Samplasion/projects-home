import express from "express";
import projects from "./projects";
import setup from "./setup";
import path from "path";

setup().then(() => {
    const app = express();

    app.use(express.json({}));

    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "index.html"));
    })
    app.get("/projects.json", (req, res) => {
        res.send(projects);
    });

    app.get("*", (req, res) => {
        const split = req.url.split("/");
        const proj = split[1];
        if (!projects[proj]) {
            return res.redirect("/");
        }

        const p = split.slice(2, split.length);
        
        res.sendFile(path.join(__dirname, "..", "projects", proj, "build", ...(p.length ? p : ["index.html"])));
        /* if ()
        var proj = req.headers.referer.replace(/https?\:\/\//, "").split("/")[1];
        console.log(proj, `/${proj}/build${req.url}`);
        if (!req.url.includes(proj))
            res.redirect(`/${proj}/build${req.url}`); */
    });

    const port = process.env.PORT || 5008;
    app.listen(port, () => {
        const proj = Object.values(projects).map(p => {
            return ` - ${p.name}: http://localhost:${port}/${p.repo}`
        })
        console.log(`Started on port ${port}.\n${proj}`);
    });
});