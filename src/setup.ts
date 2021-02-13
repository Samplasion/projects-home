import fs from "fs/promises";
import { Dir, existsSync, realpathSync } from "fs";
import path from "path";
import projects from "./projects";
import { exec } from "child_process";
import os from "os";

async function sh(command: string) {
    return new Promise<[string, string]>((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            return error ? reject(error) : resolve([stdout, stderr]);
        });
    });
}

export default async function setup() {
    const projDir = path.join(realpathSync(path.join(__dirname, "..")), "projects");
    await sh(`mkdir ${os.platform() == "win32" ? "" : "-p"} ${projDir}`).catch(() => {});
    const promises = [] as Promise<any>[];
    for (const project of Object.values(projects)) {
        await sh(
            existsSync(path.join(projDir, project.repo)) ?
            `cd ${path.join(projDir, project.repo)} && git pull origin master` :
            `cd ${projDir} && git submodule add --force https://github.com/Samplasion/${project.repo}.git`
        ).then(() => {
            console.log(`[SETUP] Cloned repo ${project.repo}`)
            promises.push(sh(`cd ${path.join(projDir, project.repo)} && yarn && yarn build`).then(() => console.log(`[SETUP] Built ${project.repo}`)));
        });
    }
    return Promise.all<void>(promises);
}