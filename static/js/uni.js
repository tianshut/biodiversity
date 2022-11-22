
            else{
                for(var i1 = 0;i1<d.children.length;i1++){
                if(j1==1)
                  break;
                d1 = d.children[i1]
                if(d1.data.data){
                  if(((d1.data.data.start_year<=timeMin&&d1.data.data.end_year<=timeMin)||(d1.data.data.start_year>=timeMax&&d1.data.data.end_year>=timeMax))){
                    
                d._inDom = false
                return true
                  }
                }
                else{
                for(var i2 = 0;i2<d1.children.length;i2++){
                  if(j2==1)
                    break;
                  d2 = d1.children[i2]
                  if(d2.data.data){
                  if(((d2.data.data.start_year<=timeMin&&d2.data.data.end_year<=timeMin)||(d2.data.data.start_year>=timeMax&&d2.data.data.end_year>=timeMax))){
                   
                d._inDom = false
                return true
                  }
                  }
                  else{
                  for(var i3 = 0;i3<d2.children.length;i3++){
                    if(j3==1)
                      break;
                    d3 = d2.children[i3]
                    if(d3.data.data){
                  if(((d3.data.data.start_year<=timeMin&&d3.data.data.end_year<=timeMin)||(d3.data.data.start_year>=timeMax&&d3.data.data.end_year>=timeMax))){
                      
                d._inDom = false
                return true
                  }
                    }
                    else{
                    for(var i4 = 0;i4<d3.children.length;i4++){
                      if(j4==1)
                        break;
                      d4 = d3.children[i4]
                      if(d4.data.data){
                        if(((d4.data.data.start_year<=timeMin&&d4.data.data.end_year<=timeMin)||(d4.data.data.start_year>=timeMax&&d4.data.data.end_year>=timeMax))){
                       
                d._inDom = false
                return true
                        }
                      }
                      else{
                      for(var i5 = 0;i5<d4.children.length;i5++){
                        if(j5==1)
                            break;
                        d5 = d4.children[i5]
                        if(d5.data.data){
                          if(((d5.data.data.start_year<=timeMin&&d5.data.data.end_year<=timeMin)||(d5.data.data.start_year>=timeMax&&d5.data.data.end_year>=timeMax))){
                         
                d._inDom = false
                return true
                          }
                        }
                        else{
                        for(var i6 = 0;i6<d5.children.length;i6++){
                          if(j6==1)
                            break;
                          d6 = d5.children[i6]
                          if(d6.data.data){
                            if(((d6.data.data.start_year<=timeMin&&d6.data.data.end_year<=timeMin)||(d6.data.data.start_year>=timeMax&&d6.data.data.end_year>=timeMax))){
                          
                d._inDom = false
                return true
                            }
                          }
                          else{
                          for(var i7 = 0;i7<d6.children.length;i7++){
                            if(j7==1)
                            break;
                            d7 = d6.children[i7]
                            if(d7.data.data){
                            if(((d7.data.data.start_year<=timeMin&&d7.data.data.end_year<=timeMin)||(d7.data.data.start_year>=timeMax&&d7.data.data.end_year>=timeMax))){
                             
                d._inDom = false
                return true
                            }
                            }
                          }
                        }
                        } 
                      }
                    }
                  } 
                  }  
                }
                }  
              }
              }  
            }
              }
            }