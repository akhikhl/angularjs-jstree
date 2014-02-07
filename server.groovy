#!/usr/bin/env groovy

@Grab('io.ratpack:ratpack-groovy:0.9.1')
@Grab('io.ratpack:ratpack-jackson:0.9.1')
@Grab('commons-codec:commons-codec:1.9')

import ratpack.jackson.JacksonModule
import static ratpack.jackson.Jackson.json
import static ratpack.groovy.Groovy.*
import org.apache.commons.codec.digest.DigestUtils

ratpack {
  modules {
    register new JacksonModule()
  }
  handlers {
    get {
      redirect '/index.htm'
    }
    get('files') {
      String parentPath = request.queryParams.parentPath
      File[] files = parentPath ? new File(new URI(parentPath).getPath()).listFiles() : File.listRoots()
      files = files.findAll { !it.name.startsWith('.') }.sort(false)
      render json(files.collect { [ 
        id: DigestUtils.md5Hex(it.absolutePath),
        text: it.name ?: it.path, 
        state: [ closed: true ], 
        children: true, 
        a_attr: [ path: it.toURI().toString() ] 
      ] })
    }
    get('homeFolder') {
      render System.getProperty('user.home')
    }
    get('pathIds') {
      List result = []
      File file = new File(new URI(request.queryParams.path).getPath())
      while(file != null) {
        result.add(0, DigestUtils.md5Hex(file.absolutePath))
        file = file.parentFile
      }
      render json(result)
    }
    assets 'public'
  }
}

