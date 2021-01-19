import fs from "fs/promises";
import { Dir, existsSync } from "fs";
import path from "path";
import projects from "./projects";
import { Repository, Submodule } from "nodegit";
import { exec } from "child_process";

async function sh(command: string) {
    return new Promise<[string, string]>((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            return error ? reject(error) : resolve([stdout, stderr]);
        });
    });
}

export default async function setup() {
    const projDir = path.join(__dirname, "..", "projects");
    const dir = await fs.opendir(path.join(__dirname, "..", "projects")).catch((): Promise<Dir> => {
        fs.mkdir(path.join(__dirname, "..", "projects"));
        return fs.opendir(path.join(__dirname, "..", "projects"));
    });
    await sh(`mkdir ${projDir}`).catch(() => {});
    for (const project of Object.values(projects)) {
        if (existsSync(path.join(projDir, project.repo)))
            await sh(`cd ${path.join(projDir, project.repo)} && git pull origin master && cd ..`);
        else await sh(`cd ${projDir} && git submodule add https://github.com/Samplasion/${project.repo}.git`);
        await sh(`cd ${path.join(projDir, project.repo)} && yarn && yarn build`);
    }
}